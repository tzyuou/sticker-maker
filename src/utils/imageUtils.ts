export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const resizeImage = (dataUrl: string, width: number, height: number): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
};

export const removeColor = (dataUrl: string, hexColor: string, tolerance: number): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      const hex = hexColor.replace('#', '');
      const rTarget = parseInt(hex.substring(0, 2), 16);
      const gTarget = parseInt(hex.substring(2, 4), 16);
      const bTarget = parseInt(hex.substring(4, 6), 16);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const distance = Math.sqrt(
          Math.pow(r - rTarget, 2) + 
          Math.pow(g - gTarget, 2) + 
          Math.pow(b - bTarget, 2)
        );

        if (distance <= tolerance) {
          data[i + 3] = 0;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
};

export const splitImage = (dataUrl: string, rows: number, cols: number, targetWidth: number = 320, targetHeight: number = 320): Promise<string[]> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const pieceWidth = img.width / cols;
      const pieceHeight = img.height / rows;
      const pieces: string[] = [];

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(
            img,
            x * pieceWidth, y * pieceHeight, pieceWidth, pieceHeight,
            0, 0, targetWidth, targetHeight
          );
          pieces.push(canvas.toDataURL('image/png'));
        }
      }
      resolve(pieces);
    };
    img.src = dataUrl;
  });
};

export const resizeImageFit = (dataUrl: string, targetWidth: number, targetHeight: number): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d')!;
      
      const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      
      const offsetX = (targetWidth - drawWidth) / 2;
      const offsetY = (targetHeight - drawHeight) / 2;
      
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
};

export const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/jpeg');
};

export const createStickerGrid = async (images: {url: string, text: string}[]): Promise<string> => {
  await document.fonts.load('600 32px "Klee One"');
  const canvas = document.createElement('canvas');
  const cols = 4;
  const rows = 4;
  const size = 320;
  canvas.width = cols * size;
  canvas.height = rows * size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = '600 32px "Klee One", cursive';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  for (let i = 0; i < images.length; i++) {
    if (i >= 16) break;
    const x = (i % cols) * size;
    const y = Math.floor(i / cols) * size;

    const img = new Image();
    img.src = images[i].url;
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });

    ctx.drawImage(img, x, y, size, size);

    const textX = x + size / 2;
    const textY = y + size - 20;

    ctx.lineWidth = 6;
    ctx.strokeStyle = 'white';
    ctx.strokeText(images[i].text, textX, textY);
    
    ctx.fillStyle = '#333333';
    ctx.fillText(images[i].text, textX, textY);
  }

  return canvas.toDataURL('image/png');
};
