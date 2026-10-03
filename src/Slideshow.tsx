import {AbsoluteFill, Img, useCurrentFrame, interpolate, staticFile} from 'remotion';
import React from 'react';

interface SlideshowProps {
  images: string[];
  durationPerImage: number;
}

export const Slideshow: React.FC<SlideshowProps> = ({
  images,
  durationPerImage,
}) => {
  const frame = useCurrentFrame();

  // Hitung gambar mana yang sedang aktif
  const currentImageIndex = Math.floor(frame / durationPerImage);
  const currentImage = images[currentImageIndex];

  // Frame relatif untuk gambar saat ini (0 sampai durationPerImage)
  const frameInCurrentImage = frame % durationPerImage;

  // Animasi fade in (30 frame pertama)
  const opacity = interpolate(frameInCurrentImage, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Animasi zoom (perlahan)
  const scale = interpolate(
    frameInCurrentImage,
    [0, durationPerImage],
    [1, 1.1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  if (!currentImage) {
    return null;
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Img
        src={staticFile(currentImage)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity,
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};
