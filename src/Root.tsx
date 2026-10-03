import {Composition} from 'remotion';
import {Slideshow} from './Slideshow';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Slideshow"
        component={Slideshow}
        durationInFrames={270}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          images: [
            '/image1.png',
            '/image2.png',
            '/image3.png',
          ],
          durationPerImage: 90,
        }}
      />
    </>
  );
};
