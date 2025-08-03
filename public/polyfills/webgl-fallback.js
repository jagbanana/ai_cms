/**
 * WebGL Fallback for Chess Board Rendering
 * 
 * Provides Canvas 2D fallback when WebGL is not available
 */

(function() {
  'use strict';
  
  // Check if WebGL is already available
  function detectWebGL() {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!context;
    } catch (e) {
      return false;
    }
  }
  
  // Only apply fallback if WebGL is not available
  if (detectWebGL()) {
    console.log('WebGL is available, no fallback needed');
    return;
  }
  
  console.warn('WebGL not available, applying Canvas 2D fallback');
  
  // Canvas 2D rendering utilities
  window.ChessCanvasFallback = {
    createBoard: function(canvas, options) {
      options = options || {};
      const ctx = canvas.getContext('2d');
      const size = options.size || 400;
      const squareSize = size / 8;
      
      // Set canvas size
      canvas.width = size;
      canvas.height = size;
      
      // Colors
      const lightSquare = options.lightColor || '#f0d9b5';
      const darkSquare = options.darkColor || '#b58863';
      
      // Draw board squares
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const isLight = (row + col) % 2 === 0;
          ctx.fillStyle = isLight ? lightSquare : darkSquare;
          ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
        }
      }
      
      return {
        drawPiece: function(piece, square) {
          const col = square.charCodeAt(0) - 97; // a-h to 0-7
          const row = 8 - parseInt(square[1]); // 1-8 to 7-0
          
          const x = col * squareSize;
          const y = row * squareSize;
          
          // Clear square
          const isLight = (row + col) % 2 === 0;
          ctx.fillStyle = isLight ? lightSquare : darkSquare;
          ctx.fillRect(x, y, squareSize, squareSize);
          
          // Draw piece (simplified text representation)
          if (piece) {
            ctx.fillStyle = piece === piece.toUpperCase() ? '#fff' : '#000';
            ctx.font = `${squareSize * 0.8}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const pieceSymbols = {
              'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
              'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
            };
            
            const symbol = pieceSymbols[piece] || piece;
            ctx.fillText(symbol, x + squareSize/2, y + squareSize/2);
          }
        },
        
        highlightSquare: function(square, color) {
          const col = square.charCodeAt(0) - 97;
          const row = 8 - parseInt(square[1]);
          
          const x = col * squareSize;
          const y = row * squareSize;
          
          ctx.strokeStyle = color || '#ffff00';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, squareSize, squareSize);
        },
        
        clearHighlights: function() {
          // Redraw the entire board
          this.redraw();
        },
        
        redraw: function() {
          // Redraw board squares
          for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
              const isLight = (row + col) % 2 === 0;
              ctx.fillStyle = isLight ? lightSquare : darkSquare;
              ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
            }
          }
        }
      };
    },
    
    // Animate moves with simple interpolation
    animateMove: function(boardRenderer, fromSquare, toSquare, piece, duration) {
      duration = duration || 300;
      const steps = 30;
      const stepDuration = duration / steps;
      
      const fromCol = fromSquare.charCodeAt(0) - 97;
      const fromRow = 8 - parseInt(fromSquare[1]);
      const toCol = toSquare.charCodeAt(0) - 97;
      const toRow = 8 - parseInt(toSquare[1]);
      
      let currentStep = 0;
      
      const animate = function() {
        const progress = currentStep / steps;
        
        // Calculate intermediate position
        const currentCol = fromCol + (toCol - fromCol) * progress;
        const currentRow = fromRow + (toRow - fromRow) * progress;
        
        // Redraw board
        boardRenderer.redraw();
        
        // Draw piece at intermediate position
        const squareSize = boardRenderer.canvas.width / 8;
        const x = currentCol * squareSize;
        const y = currentRow * squareSize;
        
        if (piece) {
          const ctx = boardRenderer.canvas.getContext('2d');
          ctx.fillStyle = piece === piece.toUpperCase() ? '#fff' : '#000';
          ctx.font = `${squareSize * 0.8}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const pieceSymbols = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
          };
          
          const symbol = pieceSymbols[piece] || piece;
          ctx.fillText(symbol, x + squareSize/2, y + squareSize/2);
        }
        
        currentStep++;
        
        if (currentStep <= steps) {
          setTimeout(animate, stepDuration);
        } else {
          // Animation complete, draw piece at final position
          boardRenderer.drawPiece(piece, toSquare);
        }
      };
      
      // Start animation
      animate();
    }
  };
  
  // Polyfill for performance.now() if not available
  if (!window.performance || !window.performance.now) {
    window.performance = window.performance || {};
    window.performance.now = function() {
      return Date.now();
    };
  }
  
  // Polyfill for requestAnimationFrame if not available
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      return setTimeout(callback, 16); // ~60fps
    };
    
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
  
  console.log('WebGL fallback loaded successfully');
})();