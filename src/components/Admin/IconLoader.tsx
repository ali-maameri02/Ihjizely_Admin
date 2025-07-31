// src/components/IconLoader.tsx
import { Star, Medal, Diamond } from "lucide-react";
import { ComponentType, SVGAttributes } from "react";

interface IconLoaderProps {
  iconName: string;
  className?: string;
}

const icons: Record<string, ComponentType<SVGAttributes<SVGElement>>> = {
  Star,
  Medal,
  Diamond
};

export default function IconLoader({ iconName, className }: IconLoaderProps) {
  const IconComponent = icons[iconName];
  
  if (!IconComponent) return null;
  
  return <IconComponent className={className} />;
}