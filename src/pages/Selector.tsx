import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import AircraftIcon from "@/components/AircraftIcon"; // Assuming this exists from Hero check
import { Check, Loader2 } from "lucide-react";
import symbolIcon from "@/assets/symbol.png";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Question {
  id: string;
  text: string;
  options: { value: string; label: string }[];
}

const questions: Question[] = [
  {
    id: "breaks",
    text: "Where do you feel work breaks most often?",
    options: [
      { value: "strategy", label: "Strategy decided, but nothing moves after meetings" },
      { value: "tools", label: "Tools exist, but team uses them inconsistently" },
      { value: "founder", label: "Founder involvement is too high in daily ops" },
      { value: "reports", label: "Reports exist, but decisions still feel unclear" },
      { value: "people", label: "Execution depends on 1–2 key people" },
    ],
  },
  {
    id: "manual",
    text: "Which function feels most \"manual\" today?",
    options: [
      { value: "sales", label: "Sales follow-ups / CRM" },
      { value: "ops", label: "Operations / internal coordination" },
      { value: "reporting", label: "Reporting / visibility / reviews" },
      { value: "marketing", label: "Marketing execution" },
      { value: "hiring", label: "Hiring / delegation / SOPs" },
    ],
  },
  {
    id: "tried",
    text: "What have you already tried?",
    options: [
      { value: "hired", label: "Hired people" },
      { value: "tools", label: "Bought tools / software" },
      { value: "consulting", label: "Took training / consulting" },
      { value: "sops", label: "Built internal SOPs" },
      { value: "nothing", label: "Nothing stuck consistently" },
    ],
  },
  {
    id: "outcome",
    text: "What outcome would matter in the next 60 days?",
    options: [
      { value: "founder_freedom", label: "Less founder dependency" },
      { value: "rhythm", label: "Predictable execution rhythm" },
      { value: "visibility", label: "Clear weekly visibility" },
      { value: "decisions", label: "Faster decisions" },
      { value: "followups", label: "Fewer follow-ups and reminders" },
    ],
  },
  {
    id: "help",
    text: "How do you want help?",
    options: [
      { value: "clarity", label: "Just clarity on what to fix" },
      { value: "design", label: "Someone to design the system" },
      { value: "implement", label: "Someone to implement and stay till it works" },
      { value: "ownership", label: "Ongoing ownership (retainer)" },
    ],
  },
];

const Selector = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(-1); // -1: Intro, 0-4: Questions, 5: Result
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentSelection, setCurrentSelection] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // User details state
  const [userDetails, setUserDetails] = useState({
    name: "",
    company_name: "",
    position: "",
    mobile_number: ""
  });

  const handleStart = () => setStep(0);

  const handleNext = () => {
    if (!currentSelection) return;
    setAnswers((prev) => ({ ...prev, [questions[step].id]: currentSelection }));
    setCurrentSelection("");
    setStep((prev) => prev + 1);
  };

  const getRecommendation = () => {
    const helpType = answers["help"];
    if (helpType === "clarity") return "implementation gap audit";
    if (helpType === "implement" || helpType === "design") return "implementation fix engagement";
    if (helpType === "ownership") return "systems-as-a-service";
    return "implementation gap audit";
  };

  const handleBookAudit = async () => {
    // Basic validation
    if (!userDetails.name || !userDetails.company_name || !userDetails.position || !userDetails.mobile_number) {
        toast.error("Please fill in all details to book the audit.");
        return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('audit_submissions').insert([
        {
          breaks: answers.breaks,
          manual: answers.manual,
          tried: answers.tried,
          outcome: answers.outcome,
          help: answers.help,
          ...userDetails
        }
      ]);

      if (error) throw error;

      try {
        const message = `New Audit Request:\nName: ${userDetails.name}\nCompany: ${userDetails.company_name}\nMobile: ${userDetails.mobile_number}`;
        
        // "Unblockable" Method: Hidden Form Submission
        // This simulates a standard browser navigation but directs it to a hidden iframe.
        // This is 100% CORS-proof because it is treated as a page navigation, not an API call.
        
        const form = document.createElement('form');
        form.method = 'GET';
        form.action = 'https://savetron.2440066.xyz/savetron_123';
        form.target = 'whatsapp_iframe'; // Target the hidden iframe
        form.style.display = 'none';

        // Add fields
        const addField = (name: string, value: string) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value;
            form.appendChild(input);
        };

        // Send confirmation to the USER'S phone number
        // Using stripped digits only, as per the working explicit URL provided by user
        const userPhone = userDetails.mobile_number.replace(/\D/g, ''); 
        
        // Format answers for display
        const diagnosisDetails = questions.map((q, i) => {
            const answerValue = answers[q.id];
            const answerLabel = q.options.find(o => o.value === answerValue)?.label || answerValue;
            return `*${i + 1}. ${q.text}*\n${answerLabel}`;
        }).join('\n\n');

        const userMessage = `Hello ${userDetails.name},\n\nWe have received your implementation audit request for *${userDetails.company_name}*.\n\n*Your Diagnosis:*\n\n${diagnosisDetails}\n\nOur team will review your inputs and reach out shortly to schedule the next steps and fix the implementation gap.\n\n- *everyday ai labs*`;

        // Using verified working credentials (from user's tested URL)
        // Sender Instance: 67E0EABCE7C50
        addField('phone', userPhone); 
        addField('instance_id', '692B487D285FA'); 
        addField('access_token', '66d137a48208a');
        addField('message', userMessage);

        console.log("Submitting hidden WhatsApp form to:", userPhone);

        document.body.appendChild(form);
        form.submit();
        
        // Cleanup after a moment
        setTimeout(() => {
            document.body.removeChild(form);
        }, 1000);

        console.log("WhatsApp notification sent via Hidden Form");

      } catch (err) {
        console.error("Error generating WhatsApp notification:", err);
      }

      toast.success("Audit request received. We'll be in touch shortly.");
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      console.error('Error submitting audit:', error);
      toast.error("Failed to submit audit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-12">
           <AircraftIcon size={40} className="text-foreground" />
        </div>

        <AnimatePresence mode="wait">
          {step === -1 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                implementation clarity selector
              </h1>
              <p className="text-xl text-muted-foreground font-light">
                most businesses don’t fail due to lack of knowledge. <br />
                they fail due to implementation gaps.
              </p>
              <p className="text-muted-foreground font-light">
                answer 5 quick questions to identify yours.
              </p>
              <Button
                onClick={handleStart}
                size="lg"
                className="bg-foreground text-background hover:bg-foreground/90 text-lg px-8 py-6 rounded-none mt-8"
              >
                start diagnosis
              </Button>
            </motion.div>
          )}

          {step >= 0 && step < questions.length && (
            <motion.div
              key={`q-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-8"
            >
               <div className="flex justify-between items-center text-sm text-muted-foreground font-light">
                <span>question {step + 1} of {questions.length}</span>
                <span>everyday ai labs</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-medium leading-tight">
                {questions[step].text}
              </h2>

              <RadioGroup
                value={currentSelection}
                onValueChange={setCurrentSelection}
                className="gap-4"
              >
                {questions[step].options.map((option) => (
                  <div
                    key={option.value}
                    className={`
                      flex items-center space-x-3 border p-4 transition-all duration-200 cursor-pointer
                      ${currentSelection === option.value 
                        ? "border-foreground bg-secondary/30" 
                        : "border-border hover:border-foreground/50"}
                    `}
                    onClick={() => setCurrentSelection(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="border-foreground text-foreground" />
                    <Label
                      htmlFor={option.value}
                      className="text-lg font-light cursor-pointer flex-1"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleNext}
                  disabled={!currentSelection}
                  className="bg-foreground text-background hover:bg-foreground/90 text-lg px-8 py-6 rounded-none gap-2 disabled:opacity-50"
                >
                  {step === questions.length - 1 ? "complete" : "next"}
                  <img src={symbolIcon} alt="Next" className="w-4 h-4 invert" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === questions.length && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-8 text-center"
            >
              <div className="flex justify-center">
                 <div className="w-16 h-16 rounded-full border border-foreground flex items-center justify-center">
                    <Check className="w-8 h-8" />
                 </div>
              </div>
              
              <h2 className="text-2xl font-light text-muted-foreground">
                diagnosis complete
              </h2>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground uppercase tracking-widest">recommended next step</p>
                <h1 className="text-3xl md:text-4xl font-semibold">
                    {getRecommendation()}
                </h1>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left border border-border bg-card/10 p-4">
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">gap location</p>
                    <p className="text-sm md:text-base font-medium">{questions[0].options.find(o => o.value === answers["breaks"])?.label}</p>
                </div>
                 <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">target function</p>
                    <p className="text-sm md:text-base font-medium">{questions[1].options.find(o => o.value === answers["manual"])?.label}</p>
                </div>
              </div>

              <div className="space-y-4 text-left bg-card/5 p-6 border border-border/50">
                  <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground text-center mb-4">Final Step: Your Details</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            placeholder="John Doe" 
                            value={userDetails.name}
                            onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
                          />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="company">Company Name</Label>
                          <Input 
                            id="company" 
                            placeholder="Acme Inc."
                            value={userDetails.company_name}
                            onChange={(e) => setUserDetails(prev => ({ ...prev, company_name: e.target.value }))}
                           />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="position">Position</Label>
                          <Input 
                            id="position" 
                            placeholder="Founder / CEO"
                            value={userDetails.position}
                            onChange={(e) => setUserDetails(prev => ({ ...prev, position: e.target.value }))}
                           />
                      </div>
                       <div className="space-y-2">
                          <Label htmlFor="mobile">Mobile Number</Label>
                          <Input 
                            id="mobile" 
                            type="tel"
                            placeholder="+1 (555) 000-0000" 
                            value={userDetails.mobile_number}
                            onChange={(e) => setUserDetails(prev => ({ ...prev, mobile_number: e.target.value }))}
                          />
                      </div>
                  </div>
              </div>

              <p className="text-lg text-muted-foreground font-light max-w-md mx-auto">
                we fix the system that creates this dependency, not the people.
              </p>

              <div className="pt-4 space-y-4">
                  <Button 
                    onClick={handleBookAudit}
                    disabled={isSubmitting}
                    className="w-full md:w-auto bg-foreground text-background text-lg px-8 py-6 rounded-none min-w-[200px]"
                  >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          booking...
                        </>
                      ) : (
                        "book audit now"
                      )}
                  </Button>
                  <p className="text-sm text-muted-foreground/50">
                    take a screenshot of this diagnosis.
                  </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Hidden Iframe for "Fire-and-Forget" Form Submission */}
        <iframe name="whatsapp_iframe" style={{ display: 'none' }} />
      </div>

      <footer className="mt-16 text-center space-y-2 text-muted-foreground/60 text-sm font-light">
         <p>+91-9789146007</p>
         <a href="mailto:hi@everydayailabs.com" className="hover:text-foreground transition-colors">hi@everydayailabs.com</a>
      </footer>
    </div>
  );
};


export default Selector;
