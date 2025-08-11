import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, GraduationCap, Home, Medal } from "lucide-react";

// SEO and UX constants
const PAGE_TITLE = "Footballer’s Hat – Story Flow";
const PAGE_DESC = "Learn the Footballer’s Hat story in 4 steps with smooth animations.";

const totalSteps = 4; // Closing card is separate

export default function DNAYou() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0..3; closing card is "done"
  const [direction, setDirection] = useState<1 | -1>(1);

  // Step 2 toggle state
  const [goodDay, setGoodDay] = useState(true);

  useEffect(() => {
    // SEO: title, description, canonical
    const prevTitle = document.title;
    document.title = PAGE_TITLE;

    const metaDesc = document.querySelector('meta[name="description"]');
    const createdDesc = !metaDesc;
    const el = metaDesc || document.createElement("meta");
    el.setAttribute("name", "description");
    el.setAttribute("content", PAGE_DESC);
    if (createdDesc) document.head.appendChild(el);

    const linkCanonical =
      document.querySelector('link[rel="canonical"]') || document.createElement("link");
    linkCanonical.setAttribute("rel", "canonical");
    linkCanonical.setAttribute("href", window.location.origin + "/dna/you");
    if (!linkCanonical.parentElement) document.head.appendChild(linkCanonical);

    return () => {
      document.title = prevTitle;
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  const next = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  };
  const prev = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const progress = useMemo(() => ((step + 1) / totalSteps) * 100, [step]);

  // Variants
  const slideVariants = {
    enter: (dir: 1 | -1) => ({ x: dir === 1 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 1 | -1) => ({ x: dir === 1 ? -40 : 40, opacity: 0 }),
  };

  const transition = { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const };

  const iconStagger = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };
  const iconItem = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 }
  };

  const Step1 = (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
      >
        <img
          src="/lovable-uploads/eab5ed4c-b868-4d1e-bf9c-a66b8ac8a9fd.png"
          alt="The Footballer’s Hat — Family, School, Footballer, and Qualities hats on a rack"
          loading="lazy"
          className="w-full rounded-md border bg-background"
        />
      </motion.div>
      <p className="text-muted-foreground">
        Think of your life like a hat rack with different hats hanging on it.
      </p>
      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
        <li>Family Hat — who you are at home.</li>
        <li>School Hat — who you are in the classroom and with friends.</li>
        <li>Footballer’s Hat — who you are on the pitch.</li>
        <li>Qualities Hat — the traits that make you… you (kind, funny, hardworking, resilient).</li>
      </ul>
      <p className="text-muted-foreground">You don’t just wear one hat. You switch between them every day.</p>
    </div>
  );

  const Step2 = (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground">Toggle mood:</div>
        <div className="flex items-center gap-1 rounded-full border p-1">
          <motion.button
            type="button"
            className={`px-3 py-1 rounded-full text-sm ${goodDay ? "bg-primary/10" : ""}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setGoodDay(true)}
          >
            Great game
          </motion.button>
          <motion.button
            type="button"
            className={`px-3 py-1 rounded-full text-sm ${!goodDay ? "bg-primary/10" : ""}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setGoodDay(false)}
          >
            Tough game
          </motion.button>
        </div>
      </div>
      <div className="min-h-[72px]">
        <AnimatePresence mode="wait">
          <motion.p
            key={goodDay ? "great" : "tough"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            className="text-muted-foreground"
          >
            {goodDay
              ? "Some days, your Footballer’s Hat feels amazing — great decisions, maybe a goal."
              : "Other days, it feels heavy — mistakes, missed chances, bad passes."}
          </motion.p>
        </AnimatePresence>
      </div>
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 0.4 }}
        className="rounded-md border p-3"
      >
        <span className="font-medium">Truth:</span>{" "}
        <span className="text-muted-foreground">
          a bad game doesn’t make you less valuable. It just means that hat had a tough day — the others are still on the rack, just as strong.
        </span>
      </motion.div>
    </div>
  );

  const Step3 = (
    <div className="space-y-4">
      <motion.ul
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.3 } },
        }}
        className="space-y-2"
      >
        {[
          "If you play badly, does it make you a worse friend?",
          "A worse son/daughter?",
          "Does it erase your effort in training?",
          "No. It’s one part of who you are — not the whole picture.",
        ].map((t, i) => (
          <motion.li key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            {t}
          </motion.li>
        ))}
      </motion.ul>
      <motion.div
        className="h-px w-full bg-border"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "left" }}
      />
    </div>
  );

  const Step4 = (
    <div className="space-y-4 relative overflow-hidden">
      {/* Subtle sparkle */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-6 -left-6 h-24 w-24 rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--primary)/0.15), transparent 60%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.0 }}
      />
      <p className="text-muted-foreground">
        Your Footballer’s Hat is different from anyone else’s. Maybe it says:
      </p>
      <motion.div
        className="flex flex-wrap gap-2"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
      >
        {[
          "Quick thinker",
          "Great first touch",
          "Leader under pressure",
        ].map((chip) => (
          <motion.span
            key={chip}
            className="px-3 py-1 rounded-full border text-sm"
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
          >
            {chip}
          </motion.span>
        ))}
      </motion.div>
      <p className="text-muted-foreground">
        Your other hats carry their own strengths too. No one else has your exact mix. That’s your identity.
      </p>
    </div>
  );

  const steps = [
    { title: "1️⃣ Your roles in life", node: Step1 },
    { title: "2️⃣ Match Day Reality", node: Step2 },
    { title: "3️⃣ The Bad Day Test", node: Step3 },
    { title: "4️⃣ Why Your Hats Are Unique", node: Step4 },
  ];

  // Swipe handling using drag
  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const { x } = info.offset;
    const v = info.velocity.x;
    const threshold = 80; // px
    if (x < -threshold || v < -400) {
      next();
    } else if (x > threshold || v > 400) {
      prev();
    }
  };

  return (
    <div className="max-w-[720px] mx-auto px-4 pt-20 pb-10">
      {/* Header */}
      <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">The Footballer’s Hat</h1>
        <p className="text-muted-foreground">A short story in 4 steps</p>
      </motion.header>

      {/* Progress */}
      <div className="mb-4">
        <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 140, damping: 20 }}
          />
          {/* Segments markers */}
          <div className="absolute inset-0 flex justify-between">
            {Array.from({ length: totalSteps - 1 }).map((_, i) => (
              <div key={i} className="h-full w-px bg-background/60" />
            ))}
          </div>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">Step {step + 1} of {totalSteps}</div>
      </div>

      {/* Flow */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{steps[step].title}</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              className="min-h-[220px]"
            >
              {steps[step].node}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="secondary" onClick={prev} disabled={step === 0}>Back</Button>
            </motion.div>
            {step < totalSteps - 1 ? (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={next}>Next</Button>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={() => navigate("/dna/you/quiz")}>Got it — take the quick self-check</Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Closing Card */}
      {step === totalSteps - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-6"
        >
          <Card className="shadow-sm">
            <CardContent className="py-6">
              <motion.p className="text-center text-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                “A bad day doesn’t change who I am — it just means I’ve got something to work on.”
              </motion.p>
              <motion.div
                className="mx-auto mt-3 h-0.5 w-40 bg-primary"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: "left" }}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
