'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { Dumbbell, TrendingUp, UserCheck } from 'lucide-react'
import Image from 'next/image'
import { useRef } from 'react'

import { AnimatedLogo, AnimatedLogoText } from '@/components/animated-logo'
import { PWAInstallButton } from '@/components/pwa-install-btn'
import { ButtonLink } from '@/components/ui/button-link'

import { Card } from './ui/card'

export function HomepageClient() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mockupSectionRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Individual refs for each mockup
  const frontMockupRef = useRef<HTMLDivElement>(null)
  const angleMockupRef = useRef<HTMLDivElement>(null)
  const sideMockupRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
  })

  // Individual scroll trackers for each mockup
  const { scrollYProgress: frontMockupProgress } = useScroll({
    target: frontMockupRef,
    container: scrollContainerRef,
    offset: ['start end', 'end start'],
  })

  const { scrollYProgress: angleMockupProgress } = useScroll({
    target: angleMockupRef,
    container: scrollContainerRef,
    offset: ['start end', 'end start'],
  })

  const { scrollYProgress: sideMockupProgress } = useScroll({
    target: sideMockupRef,
    container: scrollContainerRef,
    offset: ['start end', 'end start'],
  })

  // Parallax animations - Reduced values to prevent overlap
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -20])
  const mockupsY = useTransform(scrollYProgress, [0, 1], [0, 30])
  const featuresY = useTransform(scrollYProgress, [0, 1], [0, 20])

  // Individual mockup zoom animations - Scale to max at center, then maintain
  const frontMockupScale = useTransform(
    frontMockupProgress,
    [0, 0.5, 1],
    [0.6, 1.1, 1.1],
  )
  const angleMockupScale = useTransform(
    angleMockupProgress,
    [0, 0.5, 1],
    [0.7, 1.15, 1.1],
  )
  const sideMockupScale = useTransform(
    sideMockupProgress,
    [0, 0.5, 1],
    [0.6, 1.1, 1.1],
  )

  // Container animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  // Individual item animations
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  }

  // Simplified hover animations for mockups
  const mockupHoverVariants = {
    hover: {
      y: -10,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
      },
    },
  }

  // Feature card animations
  const featureVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 150,
        damping: 20,
        delay: 0.8 + i * 0.1,
      },
    }),
    hover: {
      scale: 1.02,
      y: -2,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
      },
    },
  }

  // More subtle text animation variants
  const subtleTextVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 20,
        duration: 0.6,
      },
    },
  }

  return (
    <div
      ref={scrollContainerRef}
      className="h-screen w-full overflow-y-auto overflow-x-hidden dark"
    >
      <main
        ref={containerRef}
        className="min-h-screen w-full bg-zinc-950 overflow-x-hidden"
      >
        {/* Hero Section */}
        <motion.section
          key="hero-section-container"
          style={{ y: heroY }}
          className="min-h-screen flex flex-col items-center justify-center px-4 relative z-20"
        >
          <motion.div
            key="hero-section-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-8 text-center max-w-4xl mx-auto"
          >
            {/* App Logo and Branding */}
            <motion.div
              key="hero-section-content-logo"
              variants={itemVariants}
              className="flex flex-col items-center gap-6"
            >
              <AnimatedLogo infinite={false} size={140} />
              <div className="space-y-4">
                <AnimatedLogoText className="text-4xl text-white" />
                <motion.p
                  key="hero-section-content-description"
                  variants={itemVariants}
                  className="text-lg md:text-xl text-zinc-300 max-w-2xl leading-relaxed"
                >
                  Your personal fitness coach. Track workouts, follow training
                  plans, and achieve your fitness goals with professional
                  guidance.
                </motion.p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              key="hero-section-content-buttons"
              variants={itemVariants}
              className="flex flex-col gap-4 w-full max-w-sm"
            >
              <PWAInstallButton
                variant="secondary"
                size="lg"
                className="w-full"
                showOnMobile={true}
              />
              <ButtonLink href="/login" className="w-full" size="lg">
                Get Started
              </ButtonLink>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Mockup Showcase Section */}
        <motion.section
          key="mockup-section"
          ref={mockupSectionRef}
          style={{ y: mockupsY }}
          className="pb-24 pt-0 px-4 relative z-10"
        >
          <motion.div
            key="mockup-section-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="max-w-7xl mx-auto"
          >
            <motion.div
              key="mockup-section-content-title"
              variants={itemVariants}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                Experience Fitspace
              </h2>
              <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
                See how Fitspace transforms your fitness journey with powerful
                features
              </p>
            </motion.div>

            {/* Mockup Images Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-20 md:gap-12 items-center">
              {/* Front Mockup */}
              <div
                ref={frontMockupRef}
                className="relative group cursor-pointer"
              >
                <motion.div
                  key="front-mockup"
                  style={{ scale: frontMockupScale }}
                  whileHover="hover"
                  variants={mockupHoverVariants}
                  className="transform-gpu"
                >
                  <Image
                    src="/mockup-front.png"
                    alt="Fitspace Mobile App Front View"
                    width={400}
                    height={800}
                    quality={95}
                    sizes="(max-width: 768px) 300px, (max-width: 1200px) 400px, 500px"
                    className="relative z-10 mx-auto w-auto h-auto max-w-[300px] md:max-w-[400px]"
                    priority
                  />
                </motion.div>
                <motion.div
                  key="front-mockup-description"
                  variants={subtleTextVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.4 }}
                  className="text-center mt-6"
                >
                  <h3 className="font-semibold text-lg mb-2 text-white">
                    Intuitive Interface
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Clean, modern design that makes fitness tracking effortless
                  </p>
                </motion.div>
              </div>

              {/* Angle Mockup - Center and larger */}
              <div
                ref={angleMockupRef}
                className="relative group cursor-pointer"
              >
                <motion.div
                  key="angle-mockup"
                  style={{ scale: angleMockupScale }}
                  whileHover="hover"
                  variants={mockupHoverVariants}
                  className="transform-gpu"
                >
                  <Image
                    src="/mockup-angle.png"
                    alt="Fitspace Mobile App Angle View"
                    width={450}
                    height={900}
                    quality={95}
                    sizes="(max-width: 768px) 320px, (max-width: 1200px) 450px, 550px"
                    className="relative z-10 mx-auto w-auto h-auto max-w-[320px] md:max-w-[450px]"
                    priority
                  />
                </motion.div>
                <motion.div
                  key="angle-mockup-description"
                  variants={subtleTextVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.4 }}
                  className="text-center mt-6"
                >
                  <h3 className="font-semibold text-lg mb-2 text-white">
                    Personal Coaching
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Connect with professional trainers for guided workouts
                  </p>
                </motion.div>
              </div>

              {/* Side Mockup */}
              <div
                ref={sideMockupRef}
                className="relative group cursor-pointer"
              >
                <motion.div
                  key="side-mockup"
                  style={{ scale: sideMockupScale }}
                  whileHover="hover"
                  variants={mockupHoverVariants}
                  className="transform-gpu"
                >
                  <Image
                    src="/mockup-side.png"
                    alt="Fitspace Mobile App Side View"
                    width={400}
                    height={800}
                    quality={95}
                    sizes="(max-width: 768px) 300px, (max-width: 1200px) 400px, 500px"
                    className="relative z-10 mx-auto w-auto h-auto max-w-[300px] md:max-w-[400px]"
                    priority
                  />
                </motion.div>
                <motion.div
                  key="side-mockup-description"
                  variants={subtleTextVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.4 }}
                  className="text-center mt-6"
                >
                  <h3 className="font-semibold text-lg mb-2 text-white">
                    Smart Tracking
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Advanced analytics and progress monitoring
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Feature Highlights */}
        <motion.section
          key="feature-section"
          style={{ y: featuresY }}
          className="py-24 px-4 bg-zinc-900 relative z-5"
        >
          <motion.div
            key="feature-section-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              key="feature-section-content-title"
              variants={subtleTextVariants}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Why Choose Fitspace?
              </h2>
              <p className="text-zinc-300">
                Everything you need to transform your fitness journey
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <TrendingUp className="h-8 w-8 text-primary" />,
                  title: 'Track Progress',
                  description:
                    'Monitor your fitness journey with detailed analytics and visual progress tracking',
                },
                {
                  icon: <Dumbbell className="h-8 w-8 text-primary" />,
                  title: 'Custom Workouts',
                  description:
                    'Personalized training plans tailored to your goals and fitness level',
                },
                {
                  icon: <UserCheck className="h-8 w-8 text-primary" />,
                  title: 'Professional Trainers',
                  description:
                    'Expert trainers to guide you every step of the way to achieving your goals',
                },
              ].map((feature, index) => (
                <motion.div
                  key={`feature-${index}`}
                  variants={featureVariants}
                  whileHover="hover"
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                >
                  <Card
                    className="border border-zinc-700 shadow-neuro-dark bg-zinc-800
                    group text-center p-8"
                  >
                    <motion.div
                      key={`feature-${index}-icon`}
                      className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="font-semibold text-xl mb-3 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* Call to Action */}
        <motion.section key="cta-section" className="py-24 px-4 relative z-5">
          <motion.div
            key="cta-section-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.h2
              key="cta-section-content-title"
              variants={subtleTextVariants}
              className="text-3xl md:text-4xl font-bold mb-6 text-white"
            >
              Ready to Transform Your Fitness?
            </motion.h2>
            <motion.p
              key="cta-section-content-description"
              variants={subtleTextVariants}
              className="text-lg text-zinc-300 mb-8"
            >
              Join thousands of users who have already started their fitness
              journey with Fitspace
            </motion.p>
            <motion.div
              key="cta-section-content-button"
              variants={subtleTextVariants}
            >
              <ButtonLink
                href="/login"
                size="lg"
                className="px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                Start Your Journey
              </ButtonLink>
            </motion.div>
          </motion.div>
        </motion.section>
      </main>
    </div>
  )
}
