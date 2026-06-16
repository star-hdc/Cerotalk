const readFileAsDataUrl = (file: File): Promise<string> => (
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result;
      if (typeof result === 'string') resolve(result);
      else reject(new Error('No se pudo leer el archivo.'));
    };
    reader.onerror = () => reject(reader.error || new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  })
);

const loadImage = (src: string): Promise<HTMLImageElement> => (
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No se pudo cargar la imagen.'));
    image.src = src;
  })
);

export async function fileToOptimizedDataUrl(file: File, maxSide = 900, quality = 0.78): Promise<string> {
  const originalDataUrl = await readFileAsDataUrl(file);

  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    return originalDataUrl;
  }

  try {
    const image = await loadImage(originalDataUrl);
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    if (!context) return originalDataUrl;

    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return originalDataUrl;
  }
}
