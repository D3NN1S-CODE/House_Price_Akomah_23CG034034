/**
 * Animated Background Component - Ambient Visual Effects
 * ========================================================
 * Creates a layered, non-interactive visual backdrop featuring:
 * 1. Floating window icons distributed across the viewport
 * 2. Continuously falling autumn leaves for organic movement
 * 
 * Design Rationale:
 * - Windows symbolize homes/real estate (thematic consistency)
 * - Falling leaves add gentle motion without distraction
 * - pointer-events-none ensures background doesn't interfere with form interactions
 * - Staggered animation delays create natural, non-synchronized movement
 * 
 * Performance Considerations:
 * - Uses CSS transforms (GPU-accelerated) for smooth 60fps animations
 * - Fixed positioning prevents layout recalculations
 * - Overflow hidden prevents scrollbars from animated elements
 */

import { Window } from './Window';  // Individual window icon component
import { Leaf } from './Leaf';      // Individual falling leaf component

export function AnimatedBackground() {
  // ========== WINDOW PLACEMENT CONFIGURATION ==========
  /**
   * Strategic positioning of window icons across the viewport
   * Each window has:
   * - top/left: percentage-based positioning for responsive layout
   * - delay: staggered entrance timing (in seconds) for cascading reveal
   * 
   * Distribution strategy: scattered across all quadrants to avoid clustering
   */
  const windows = [
    { top: '10%', left: '15%', delay: 0 },      // Top-left quadrant, immediate
    { top: '25%', left: '75%', delay: 1 },      // Top-right, 1s delay
    { top: '60%', left: '10%', delay: 2 },      // Bottom-left, 2s delay
    { top: '70%', left: '80%', delay: 1.5 },    // Bottom-right, 1.5s delay
    { top: '40%', left: '85%', delay: 2.5 },    // Right-center, 2.5s delay
    { top: '15%', left: '50%', delay: 0.5 },    // Top-center, 0.5s delay
  ];

  // ========== LEAF ANIMATION CONFIGURATION ==========
  /**
   * Procedurally generate 15 falling leaf instances with randomized properties
   * Creates organic, non-repetitive motion through variance in:
   * - delay: when each leaf starts falling (0s to 30s spread)
   * - duration: how long the fall takes (10-15 seconds)
   * - startX: horizontal starting position (0-100% across viewport)
   * 
   * The 2-second multiplier on delay creates a staggered cascade effect
   */
  const leaves = Array.from({ length: 15 }, (_, i) => ({
    key: i,                                      // Unique identifier for React keys
    delay: i * 2,                                // Stagger start times by 2s intervals
    duration: 10 + Math.random() * 5,            // Random fall speed between 10-15s
    startX: Math.random() * 100 + '%',           // Random horizontal position
  }));

  return (
    // Background container layer - sits behind all content, doesn't block interactions
    // fixed: pins to viewport edges regardless of scroll
    // inset-0: stretches to all four edges (equivalent to top/right/bottom/left: 0)
    // overflow-hidden: prevents animated elements from creating scrollbars
    // pointer-events-none: allows clicks to pass through to underlying content
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* 
        Render Window Icons
        Each window appears at its configured position with individual entrance animation
      */}
      {windows.map((window, index) => (
        <Window
          key={index}                // React key for efficient reconciliation
          top={window.top}           // Vertical position (percentage)
          left={window.left}         // Horizontal position (percentage)
          delay={window.delay}       // Animation start delay (seconds)
        />
      ))}

      {/* 
        Render Falling Leaf Animations
        Creates continuous gentle motion across the entire background
        Each leaf follows an independent animation loop with unique timing
      */}
      {leaves.map((leaf) => (
        <Leaf
          key={leaf.key}                       // Unique identifier for this leaf instance
          delay={leaf.delay}                   // When this leaf begins its fall animation
          duration={leaf.duration}             // How long the complete fall takes
          startX={parseFloat(leaf.startX)}     // Horizontal starting position (0-100)
        />
      ))}
    </div>
  );
}
