import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env file
config()

const supabaseUrl = process.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'present' : 'MISSING')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'present' : 'MISSING')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function findMigratedPDFs() {
  console.log('\n=== Finding Products with Migrated PDF Files ===\n')

  // Step 1: Get PDF files from directus_files where storage='supabase' and type='application/pdf'
  console.log('Step 1: Querying directus_files for migrated PDFs...')

  const { data: pdfFiles, error: pdfError } = await supabase
    .from('directus_files')
    .select('id, filename_download, storage, type, uploaded_on')
    .eq('storage', 'supabase')
    .eq('type', 'application/pdf')
    .limit(10)

  if (pdfError) {
    console.error('Error fetching PDF files:', pdfError)
    return
  }

  console.log(`Found ${pdfFiles?.length || 0} migrated PDF files:\n`)

  if (!pdfFiles || pdfFiles.length === 0) {
    console.log('No migrated PDF files found in directus_files table.')
    return
  }

  // Display the PDF files
  pdfFiles.forEach((file, index) => {
    console.log(`${index + 1}. ID: ${file.id}`)
    console.log(`   Filename: ${file.filename_download}`)
    console.log(`   Uploaded: ${file.uploaded_on}`)
    console.log('')
  })

  // Step 2: Find products that reference these PDFs
  console.log('\nStep 2: Finding products that reference these PDFs...\n')

  const pdfFileIds = pdfFiles.map(f => f.id)

  // Query products for spec_sheet or tech_file (note: need to check actual column names)
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, spec_sheet, revit_file, active')
    .or(`spec_sheet.in.(${pdfFileIds.join(',')}),revit_file.in.(${pdfFileIds.join(',')})`)

  if (productsError) {
    console.error('Error fetching products:', productsError)
    return
  }

  if (!products || products.length === 0) {
    console.log('No products found referencing these PDF files.')
    console.log('\nNote: The products table may use different column names.')
    console.log('Checking schema for PDF-related columns...\n')

    // Try to get a sample product to see available columns
    const { data: sampleProduct } = await supabase
      .from('products')
      .select('*')
      .limit(1)
      .single()

    if (sampleProduct) {
      console.log('Available product columns:')
      Object.keys(sampleProduct).forEach(key => {
        if (key.toLowerCase().includes('file') ||
            key.toLowerCase().includes('pdf') ||
            key.toLowerCase().includes('spec') ||
            key.toLowerCase().includes('tech') ||
            key.toLowerCase().includes('document')) {
          console.log(`  - ${key}: ${sampleProduct[key]}`)
        }
      })
    }
    return
  }

  console.log(`Found ${products.length} products with migrated PDFs:\n`)

  products.forEach((product, index) => {
    console.log(`${index + 1}. Product: ${product.name}`)
    console.log(`   ID: ${product.id}`)
    console.log(`   Active: ${product.active}`)

    if (product.spec_sheet && pdfFileIds.includes(product.spec_sheet)) {
      const pdfFile = pdfFiles.find(f => f.id === product.spec_sheet)
      console.log(`   Spec Sheet: ${product.spec_sheet} (${pdfFile?.filename_download})`)
    }

    if (product.revit_file && pdfFileIds.includes(product.revit_file)) {
      const pdfFile = pdfFiles.find(f => f.id === product.revit_file)
      console.log(`   Revit File: ${product.revit_file} (${pdfFile?.filename_download})`)
    }

    console.log('')
  })

  // Step 3: Provide summary for testing
  console.log('\n=== Summary for Testing ===\n')
  console.log('You can test PDF downloads with these product IDs and file IDs:\n')

  products.forEach((product, index) => {
    if (product.spec_sheet && pdfFileIds.includes(product.spec_sheet)) {
      const pdfFile = pdfFiles.find(f => f.id === product.spec_sheet)
      console.log(`Test ${index + 1}:`)
      console.log(`  Product ID: ${product.id}`)
      console.log(`  Product Name: ${product.name}`)
      console.log(`  File ID: ${product.spec_sheet}`)
      console.log(`  File Name: ${pdfFile?.filename_download}`)
      console.log(`  File Type: spec_sheet`)
      console.log('')
    }
  })
}

findMigratedPDFs().catch(console.error)
