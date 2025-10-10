'use server';

export async function getLogoLightUrl() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Fetch global_settings with logo_light file reference
    const response = await fetch(
      `${supabaseUrl}/rest/v1/global_settings?select=logo_light`,
      {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching global settings:', errorText);
      return { success: false, logoUrl: null };
    }

    const settings = await response.json();

    if (!settings || settings.length === 0 || !settings[0].logo_light) {
      console.error('No logo_light found in global_settings');
      return { success: false, logoUrl: null };
    }

    const logoLightFileId = settings[0].logo_light;

    // Fetch the file details from directus_files
    const fileResponse = await fetch(
      `${supabaseUrl}/rest/v1/directus_files?id=eq.${logoLightFileId}&select=filename_disk,storage`,
      {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
      }
    );

    if (!fileResponse.ok) {
      const errorText = await fileResponse.text();
      console.error('Error fetching file details:', errorText);
      return { success: false, logoUrl: null };
    }

    const files = await fileResponse.json();

    if (!files || files.length === 0 || !files[0].filename_disk) {
      console.error('No file found with id:', logoLightFileId);
      return { success: false, logoUrl: null };
    }

    const fileData = files[0];

    // Construct the full URL to the file in the directus-uploads bucket
    const logoUrl = `${supabaseUrl}/storage/v1/object/public/directus-uploads/${fileData.filename_disk}`;

    return { success: true, logoUrl };
  } catch (error) {
    console.error('Unexpected error fetching logo:', error);
    return { success: false, logoUrl: null };
  }
}

export async function getLogoColorUrl() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Fetch global_settings with logo_color file reference
    const response = await fetch(
      `${supabaseUrl}/rest/v1/global_settings?select=logo_color`,
      {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching global settings:', errorText);
      return { success: false, logoUrl: null };
    }

    const settings = await response.json();

    if (!settings || settings.length === 0 || !settings[0].logo_color) {
      console.error('No logo_color found in global_settings');
      return { success: false, logoUrl: null };
    }

    const logoColorFileId = settings[0].logo_color;
    console.log('Logo Color File ID:', logoColorFileId);

    // Fetch the file details from directus_files
    const fileResponse = await fetch(
      `${supabaseUrl}/rest/v1/directus_files?id=eq.${logoColorFileId}&select=filename_disk,storage`,
      {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
      }
    );

    if (!fileResponse.ok) {
      const errorText = await fileResponse.text();
      console.error('Error fetching file details:', errorText);
      return { success: false, logoUrl: null };
    }

    const files = await fileResponse.json();
    console.log('File details:', files);

    if (!files || files.length === 0 || !files[0].filename_disk) {
      console.error('No file found with id:', logoColorFileId);
      return { success: false, logoUrl: null };
    }

    const fileData = files[0];

    // Construct the full URL to the file in the directus-uploads bucket
    const logoUrl = `${supabaseUrl}/storage/v1/object/public/directus-uploads/${fileData.filename_disk}`;

    console.log('Constructed logo URL:', logoUrl);
    return { success: true, logoUrl };
  } catch (error) {
    console.error('Unexpected error fetching logo:', error);
    return { success: false, logoUrl: null };
  }
}
