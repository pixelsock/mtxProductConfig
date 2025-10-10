'use server';

import { CustomerInfo, ProductConfig } from '@/store/types';

interface QuoteSubmissionData {
  quoteItems: ProductConfig[];
  customerInfo: CustomerInfo;
  pdfBlob: string; // Base64 encoded PDF
  filename: string;
}

export async function submitQuoteRequest(data: QuoteSubmissionData) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Convert base64 to buffer for upload
    const base64Data = data.pdfBlob.split(',')[1]; // Remove data:application/pdf;base64, prefix
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload PDF to Supabase Storage
    const storagePath = `${Date.now()}-${data.filename}`;
    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/quote_requests/${storagePath}`,
      {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/pdf',
        },
        body: buffer,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Error uploading PDF:', errorText);
      return {
        success: false,
        error: `PDF upload failed: ${errorText}`,
      };
    }

    // Get public URL for the uploaded PDF
    const pdfUrl = `${supabaseUrl}/storage/v1/object/public/quote_requests/${storagePath}`;

    // Insert quote request into database with the storage URL
    const response = await fetch(`${supabaseUrl}/rest/v1/quote_requests`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        customer_name: data.customerInfo.name,
        customer_email: data.customerInfo.email,
        customer_phone: data.customerInfo.phone,
        company_name: data.customerInfo.company,
        project_name: data.customerInfo.projectName,
        project_location: data.customerInfo.projectLocation,
        desired_delivery_date: data.customerInfo.desiredDeliveryDate,
        specifier: data.customerInfo.specifier,
        project_notes: data.customerInfo.projectNotes,
        quote_items: data.quoteItems,
        pdf_url: pdfUrl,
        status: 'pending',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error submitting quote request:', errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
      };
    }

    const quoteRequest = await response.json();

    return {
      success: true,
      data: Array.isArray(quoteRequest) ? quoteRequest[0] : quoteRequest,
      pdfUrl, // Return the storage URL
    };
  } catch (error) {
    console.error('Unexpected error submitting quote request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function uploadQuotePdf(pdfBlob: Blob, filename: string) {
  try {
    const supabase = createServiceRoleClient();

    // Upload PDF to Supabase Storage
    const { data, error } = await supabase.storage
      .from('quote-pdfs')
      .upload(`quotes/${filename}`, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading PDF:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Get public URL for the uploaded PDF
    const { data: urlData } = supabase.storage
      .from('quote-pdfs')
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Unexpected error uploading PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
