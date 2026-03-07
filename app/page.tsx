import { Navbar } from "@/components/shared/navbar";
import { Hero } from "@/components/landing/hero";
import { SocialProofBar } from "@/components/landing/social-proof-bar";
import { HowItWorks } from "@/components/landing/how-it-works";
import { RecruiterQuestions } from "@/components/landing/recruiter-questions";
import { UseCaseShowcase } from "@/components/landing/use-case-showcase";
import { WhyPersonal } from "@/components/landing/why-personal";
import { PricingSection } from "@/components/landing/pricing-section";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <Hero />
      <SocialProofBar />
      <HowItWorks />
      <UseCaseShowcase />
      <RecruiterQuestions />
      <WhyPersonal />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
