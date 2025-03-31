import React, { useRef, useEffect } from 'react';
import goldImgSrc from '../assets/gold.png'; // adjust path
import backgroundImgSrc from '../assets/background.png'; // optional

const GoldMiner = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const goldImg = new Image();
    goldImg.src = goldImgSrc;

    let angle = 0; // Start angle for the rope
    let angleSpeed = 2; // Speed at which the rope swings
    let direction = 1; // Direction of the swing: 1 for right, -1 for left
    let length = 100; // Initial length of the rope
    let extending = false;
    let retracting = false;
    const baseX = canvas.width / 2;
    const baseY = 0;
    const maxLength = 1000; // fallback max length
    const minLength = 100;

    // Function to generate random positions for gold pieces
    const generateRandomGold = (count) => {
      const golds = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random() * (canvas.width - 40); // Random x within canvas width
        const y = Math.random() * (canvas.height - 40); // Random y within canvas height
        golds.push({ x, y, value: Math.floor(Math.random() * 100) + 50 }); // Random value between 50 and 150
      }
      return golds;
    };

    // Generate random gold pieces each time the page is reloaded
    let golds = generateRandomGold(5); // Generate 5 random gold pieces

    let score = 0;
    let grabbedGold = null;

    canvas.addEventListener("click", () => {
      if (!extending && !retracting) extending = true;
    });

    const checkCollision = (clawX, clawY) => {
      for (let g of golds) {
        let dist = Math.hypot(clawX - g.x, clawY - g.y);
        if (dist < 30) {
          grabbedGold = g;
          extending = false;
          retracting = true;
          break;
        }
      }
    };

    const update = () => {
      // Only swing when not extending or retracting
      if (!extending && !retracting) {
        angle += angleSpeed * direction;
        if (angle > 180 || angle < 0) direction *= -1; // wider swing
      }

      if (extending) {
        length += 5;
        const dx = Math.cos((angle * Math.PI) / 180) * length;
        const dy = Math.sin((angle * Math.PI) / 180) * length;

        // Check collision with gold
        checkCollision(baseX + dx, baseY + dy);

        // If we reach the preset maximum or the tip goes out-of-bound, stop extending
        if (
          length >= maxLength ||
          baseX + dx < 0 ||
          baseX + dx > canvas.width ||
          baseY + dy < 0 ||
          baseY + dy > canvas.height
        ) {
          extending = false;
          retracting = true;
        }
      }

      if (retracting) {
        length -= 5;
        if (length <= minLength) {
          length = minLength;
          retracting = false;
          if (grabbedGold) {
            score += grabbedGold.value;
            golds = golds.filter(g => g !== grabbedGold);
            grabbedGold = null;
          }
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the rope/claw line
      const dx = Math.cos((angle * Math.PI) / 180) * length;
      const dy = Math.sin((angle * Math.PI) / 180) * length;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(baseX + dx, baseY + dy);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw gold pieces
      for (let g of golds) {
        ctx.drawImage(goldImg, g.x - 20, g.y - 20, 40, 40);
      }

      // Display the score
      ctx.fillStyle = "black";
      ctx.font = "24px Arial";
      ctx.fillText(`Score: ${score}`, 10, 30);
    };

    const gameLoop = () => {
      update();
      draw();
      requestAnimationFrame(gameLoop);
    };

    goldImg.onload = () => {
      gameLoop();
    };
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          border: "2px solid black",
          background: `url(${backgroundImgSrc}) no-repeat center`,
          backgroundSize: "cover"
        }}
      />
    </div>
  );
};

export default GoldMiner;
