import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import AircraftIcon from "../AircraftIcon";

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-3xl text-center space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <AircraftIcon size={60} className="text-foreground mx-auto" />
          
          <h2 className="text-2xl md:text-3xl font-light text-foreground">
            ready to fix what's broken?
          </h2>
          
          <p className="text-muted-foreground text-base md:text-lg font-light leading-relaxed max-w-md mx-auto">
            we take one real business problem and stay until execution works.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          <Link
            to="/selector"
            className="inline-block border border-foreground px-8 py-4 text-foreground text-base font-light hover:bg-foreground hover:text-background transition-colors duration-300"
          >
            start the conversation
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="pt-16 space-y-4"
        >
          <p className="text-muted-foreground/50 text-sm font-light">
            everyday ai labs
          </p>
          <p className="text-muted-foreground/40 text-xs font-light">
            we fix the implementation gap
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
