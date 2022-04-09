import React, { useEffect, useRef } from 'react';

export const Visualizer = () => {
  const canvasRef = useRef(null);

  // useEffect(() => {
  //   if (window !== undefined) {
  //     if (audio) {
  //       const { AudioContext } = window;
  //       const ctx = new AudioContext();

  //       const src = ctx.createMediaElementSource(audio);
  //       setSource(src);

  //       const analayser = ctx.createAnalyser();
  //       src.connect(analayser);
  //       analayser.connect(ctx.destination);
  //       setAnalyserCtx(analayser);
  //     }
  //   }
  // }, [audio]);

  useEffect(() => {
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    const canvas: any = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const audio: any = document.querySelector('audio');

    const audioSrc = context.createMediaElementSource(audio);
    audioSrc.connect(analyser);
    audioSrc.connect(context.destination);
    analyser.connect(context.destination);

    const circleX = canvas.width / 2;
    const circleY = canvas.height / 2;
    const bars = 100;
    const barWidth = 3;
    const radius = 80;

    let scale = 1;

    function renderFrame() {
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(freqData);

      // Used to clear canvas after using setTransform elsewhere
      // https://stackoverflow.com/a/6722031
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = '#93d7fd';

      function updateScale() {
        scale = freqData[0] / 1000 + 0.7;
      }

      updateScale();

      function drawRectangle(rad: any, barHeight: any) {
        ctx.setTransform(scale, 0, 0, scale, circleX, circleY);
        // ctx.filter = 'blur(1px) drop-shadow(0 0 0.3rem black)';

        ctx.rotate(rad);
        ctx.translate(0, radius);
        ctx.fillRect(
          -barWidth / 2, // centered on x
          0, // from the inner radius
          barWidth,
          barHeight // until its own height
        );
      }

      for (let i = 0; i < Math.PI * 2; i += (Math.PI * 2) / bars) {
        drawRectangle(i, freqData[Math.round((i * 100) / 5)]);
      }

      // for (let i = 0; i < Math.PI * 2; i += (Math.PI * 2) / bars) {
      //   ctx.setTransform(1, 0, 0, 1, circleX, circleY);

      //   ctx.rotate(i);
      //   ctx.translate(0, radius);
      //   let bar_x = i * 3;
      //   let bar_width = 2;
      //   let bar_height = -(freqData[i] / 2);
      //   ctx.fillRect(-bar_width / 2, 0, bar_width, bar_height);
      // }
    }
    renderFrame();
  }, []);

  // useEffect(() => {
  //   const canvas: any = canvasRef.current;
  //   const context = canvas.getContext('2d');

  //   context.fillStyle = 'transparent';
  //   context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  //   // the position of the whole thing
  //   const circleX = canvas.width / 2;
  //   const circleY = canvas.height / 2;
  //   //
  //   const bars = 100;
  //   const barWidth = 3;
  //   // inner radius
  //   const radius = 100;
  //   context.fillStyle = 'yellow';

  //   function drawRectangle(rad: any, barHeight: any) {
  //     // reset and move to the center of our circle
  //     context.setTransform(1, 0, 0, 1, circleX, circleY);
  //     // rotate the context so we face the correct angle
  //     context.rotate(rad);
  //     // move along y axis to reach the inner radius
  //     context.translate(0, radius);
  //     // draw the bar
  //     context.fillRect(
  //       -barWidth / 2, // centered on x
  //       0, // from the inner radius
  //       barWidth,
  //       barHeight // until its own height
  //     );
  //   }

  //   if (frequencyData) {
  //     console.log('has');
  //     for (let i = 0; i < Math.PI * 2; i += (Math.PI * 2) / bars) {
  //       drawRectangle(i, Math.random() * 30 + 10);
  //     }
  //   } else {
  //     for (let i = 0; i < Math.PI * 2; i += (Math.PI * 2) / bars) {
  //       drawRectangle(i, Math.random() * 30 + 10);
  //     }
  //   }
  // }, [frequencyData]);

  // useEffect(() => {
  //   let interval: ReturnType<typeof setInterval>;
  //   if (player.status === 'PLAYING') {
  //     interval = setInterval(() => {
  //       const freqData = new Uint8Array(analyserCtx.frequencyBinCount);
  //       analyserCtx.getByteFrequencyData(freqData);
  //       setFrequencyData(freqData);
  //       console.log(freqData);
  //     }, 1000);
  //   }

  //   return () => clearInterval(interval);
  // }, [analyserCtx, player.status, source]);

  return (
    <div>
      <canvas id="visualizer" ref={canvasRef} height={500} width={500} />
    </div>
  );
};
