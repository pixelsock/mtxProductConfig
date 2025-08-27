// Utility to fetch SVG markup from Directus file API by file ID or local file path
// Uses Vite proxy to avoid CORS issues for Directus files, direct fetch for local files

export async function fetchDirectusSvg(fileId: string): Promise<string> {
  try {
    // Check if this is a local file path (starts with /)
    if (fileId.startsWith('/')) {
      console.log(`Fetching local SVG file: ${fileId}`);
      const resp = await fetch(fileId);
      if (!resp.ok) throw new Error(`Failed to fetch local SVG ${fileId}: ${resp.statusText}`);
      const svgContent = await resp.text();
      return svgContent;
    }
    
    // Otherwise, treat as Directus file ID and use proxy
    const url = `/api/assets/${fileId}`;
    console.log(`Fetching SVG via proxy: ${url}`);
    
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to fetch SVG for fileId ${fileId}: ${resp.statusText}`);
    
    const svgContent = await resp.text();
    return svgContent;
  } catch (error) {
    console.error(`Error fetching SVG for fileId ${fileId}:`, error);
    return ''; // Return empty string on error to prevent rendering failures
  }
}
