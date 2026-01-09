import { motion } from "framer-motion";
import symbolIcon from "@/assets/logo.png";

interface AircraftIconProps {
  className?: string;
  size?: number;
}

const AircraftIcon = ({ className = "", size = 80 }: AircraftIconProps) => {
  return (
    <motion.img
      src={symbolIcon}
      alt="Everyday AI Labs"
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{
        width: size,
        height: size,
        objectFit: "contain"
      }}
    />
  );
};

export default AircraftIcon;
