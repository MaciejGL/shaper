'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { Dumbbell, TrendingUp, UserCheck } from 'lucide-react'
import Image from 'next/image'
import { useRef } from 'react'

import { AnimatedLogo, AnimatedLogoText } from '@/components/animated-logo'
import { PWAInstallButton } from '@/components/pwa-install-btn'
import { MockupGradient, OrbGradient } from '@/components/smooth-gradient'
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
      className="h-screen w-full overflow-y-auto overflow-x-hidden"
    >
      <main
        ref={containerRef}
        className="min-h-screen w-full bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800 overflow-x-hidden"
      >
        {/* Hero Section */}
        <motion.section
          style={{ y: heroY }}
          className="min-h-screen flex flex-col items-center justify-center px-4 relative z-20"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-8 text-center max-w-4xl mx-auto"
          >
            {/* App Logo and Branding */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center gap-6"
            >
              <AnimatedLogo infinite={false} size={140} />
              <div className="space-y-4">
                <AnimatedLogoText className="text-4xl" />
                <motion.p
                  variants={itemVariants}
                  className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
                >
                  Your personal fitness coach. Track workouts, follow training
                  plans, and achieve your fitness goals with professional
                  guidance.
                </motion.p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
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

          {/* Floating gradient orbs for background decoration - Using new component */}
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
            className="absolute top-1/4 right-1/4"
          >
            <OrbGradient
              size="large"
              colors={{
                primary: 'rgba(59, 131, 246, 0.421)',
                secondary: 'rgba(132, 90, 232, 0.307)',
                accent: 'rgba(59, 131, 246, 0.209)',
              }}
            />
          </motion.div>
          <motion.div
            animate={{
              scale: [1.4, 1, 1.4],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 15,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
            className="absolute bottom-1/4 left-1/4"
          >
            <OrbGradient
              size="medium"
              colors={{
                primary: 'rgba(138, 92, 246, 0.629)',
                secondary: 'rgba(59, 131, 246, 0.337)',
                accent: 'rgba(139, 92, 246, 0.25)',
              }}
            />
          </motion.div>
        </motion.section>

        {/* Mockup Showcase Section */}
        <motion.section
          ref={mockupSectionRef}
          style={{ y: mockupsY }}
          className="pb-24 pt-0 px-4 relative z-10"
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="max-w-7xl mx-auto"
          >
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
                Experience Fitspace
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
                  key="front"
                  style={{ scale: frontMockupScale }}
                  whileHover="hover"
                  variants={mockupHoverVariants}
                  className="transform-gpu"
                >
                  <MockupGradient
                    index={0}
                    colors={{
                      primary: 'rgba(59, 131, 246, 0.007)',
                      secondary: 'rgba(99, 101, 241, 0.7)',
                    }}
                  />
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
                  variants={subtleTextVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.4 }}
                  className="text-center mt-6"
                >
                  <h3 className="font-semibold text-lg mb-2">
                    Intuitive Interface
                  </h3>
                  <p className="text-sm text-muted-foreground">
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
                  key="angle"
                  style={{ scale: angleMockupScale }}
                  whileHover="hover"
                  variants={mockupHoverVariants}
                  className="transform-gpu"
                >
                  <MockupGradient
                    index={1}
                    colors={{
                      primary: 'rgba(139, 92, 246, 0.34)',
                      secondary: 'rgba(168, 85, 247, 0.15)',
                    }}
                  />
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
                  variants={subtleTextVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.4 }}
                  className="text-center mt-6"
                >
                  <h3 className="font-semibold text-lg mb-2">
                    Personal Coaching
                  </h3>
                  <p className="text-sm text-muted-foreground">
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
                  style={{ scale: sideMockupScale }}
                  whileHover="hover"
                  variants={mockupHoverVariants}
                  className="transform-gpu"
                >
                  <MockupGradient
                    index={2}
                    colors={{
                      primary: 'rgba(39, 112, 229, 0.452)',
                      secondary: 'rgba(138, 92, 246, 0.338)',
                    }}
                  />
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
                  variants={subtleTextVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.4 }}
                  className="text-center mt-6"
                >
                  <h3 className="font-semibold text-lg mb-2">Smart Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced analytics and progress monitoring
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Feature Highlights */}
        <motion.section
          style={{ y: featuresY }}
          className="py-24 px-4 bg-gradient-to-r from-zinc-50/50 to-zinc-100/50 dark:from-zinc-900/50 dark:to-zinc-800/50 relative z-5"
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              variants={subtleTextVariants}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose Fitspace?
              </h2>
              <p className="text-muted-foreground">
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
                <Card
                  variant="gradient"
                  className="border border-border shadow-neuro-light dark:shadow-neuro-dark"
                  key={feature.title}
                >
                  <motion.div
                    key={feature.title}
                    variants={featureVariants}
                    whileHover="hover"
                    custom={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="group text-center p-8"
                  >
                    <motion.div
                      className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="font-semibold text-xl mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                </Card>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* Call to Action */}
        <motion.section className="py-24 px-4 relative z-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.h2
              variants={subtleTextVariants}
              className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent"
            >
              Ready to Transform Your Fitness?
            </motion.h2>
            <motion.p
              variants={subtleTextVariants}
              className="text-lg text-muted-foreground mb-8"
            >
              Join thousands of users who have already started their fitness
              journey with Fitspace
            </motion.p>
            <motion.div variants={subtleTextVariants}>
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
