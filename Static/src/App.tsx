/**
 * Main Application Component - House Price Prediction Interface
 * ==============================================================
 * This is the root component that orchestrates the entire user interface for the
 * "Cornerstone" house price prediction application. It implements a warm, inviting
 * design system with animated elements to create an engaging user experience.
 * 
 * Design Philosophy:
 * - Earthy color palette (#fef3e2, #c85347, #5c3d2e) evokes trust and stability
 * - Layered architecture: animated background → content → interactive form
 * - Motion-driven interactions for modern, polished feel
 * - Semantic HTML structure with accessibility considerations
 * 
 * Component Hierarchy:
 * App (this)
 *   ├── AnimatedBackground (floating windows + falling leaves)
 *   ├── Header section (title + description)
 *   ├── PredictionForm (main interactive element)
 *   └── Footer (attribution text)
 * 
 * Technical Stack:
 * - Framer Motion: Declarative animation library for React
 * - Tailwind CSS: Utility-first styling framework
 * - TypeScript: Type-safe component development
 */

import { AnimatedBackground } from './components/AnimatedBackground';
import { PredictionForm } from './components/PredictionForm';
import { motion } from 'motion/react';  // Enables smooth entrance animations and transitions

export default function App() {
  return (
    // Main container: full viewport height, prevents scrollbar from background animations
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#fef3e2' }}>
      {/* 
        Layer 1: Ambient Animated Background
        Renders behind all content at z-index 0 (default)
        Creates visual interest without distracting from core functionality
      */}
      <AnimatedBackground />

      {/* 
        Layer 2: Main Content Container
        Positioned above background with z-10
        Flexbox centering ensures content remains centered regardless of viewport size
      */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 py-16">
        {/* 
          Hero Section: Brand Identity and Value Proposition
          Animates in from above (y: -30 → 0) over 800ms
          Creates welcoming first impression with smooth entrance
        */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}  // Start invisible and slightly above final position
          animate={{ opacity: 1, y: 0 }}     // Fade in while sliding down to natural position
          transition={{ duration: 0.8 }}      // Smooth 800ms animation duration
          className="text-center mb-12"       // Center text with bottom margin spacing
        >
          {/* 
            Application Title: "Cornerstone"
            Evokes the foundation of homeownership with strong visual hierarchy
            Text shadow adds depth and improves readability against varied backgrounds
          */}
          <h1 
            className="mb-4"
            style={{ 
              color: '#c85347',  // Warm terracotta red - primary brand color
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'  // Subtle depth effect
            }}
          >
            Cornerstone
          </h1>
          
          {/* 
            Value Proposition Statement
            Explains the application's purpose in clear, benefit-focused language
            Max-width constraint improves readability by preventing overly long lines
          */}
          <p 
            className="max-w-xl mx-auto"  // Constrain to ~42em for optimal reading
            style={{ color: '#5c3d2e' }}   // Deep brown - complements primary color
          >
            Discover the true value of your home with our intelligent prediction tool. 
            Enter your property details and get an instant estimate based on market data and key features.
          </p>
        </motion.div>

        {/* 
          Core Interactive Component: Price Prediction Form
          Handles all user input and displays ML model predictions
          This is the primary interface where users interact with our trained model
        */}
        {/* 
          Core Interactive Component: Price Prediction Form
          Handles all user input and displays ML model predictions
          This is the primary interface where users interact with our trained model
        */}
        <PredictionForm />

        {/* 
          Footer: Attribution and Brand Message
          Delayed entrance (1 second) creates a layered reveal effect
          Fades in after user has absorbed hero content and form
        */}
        <motion.footer
          initial={{ opacity: 0 }}           // Start completely transparent
          animate={{ opacity: 1 }}           // Fade to full visibility
          transition={{ delay: 1, duration: 0.8 }}  // Wait 1s, then animate over 800ms
          className="mt-12 text-center opacity-70"  // Top margin spacing, subtle transparency
          style={{ color: '#8b5a3c' }}       // Muted brown for non-critical content
        >
          {/* 
            Friendly tagline that humanizes the technical prediction tool
            Positions the app as thoughtfully designed rather than purely algorithmic
          */}
          <p>Built with care for homeowners and real estate enthusiasts</p>
        </motion.footer>
      </div>
    </div>
  );
}
