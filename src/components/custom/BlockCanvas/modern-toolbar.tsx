import React from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  Heading1, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Code,
  Link,
  Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className }: ToolbarProps) {
  const iconSize = 16;
  
  return (
    <div className={cn(
      "w-full bg-background border-b border-border px-4 py-2 flex items-center gap-2 font-mono text-sm",
      className
    )}>
      {/* Format Group */}
      <div className="flex items-center gap-1 pr-3 border-r border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bold size={iconSize} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Italic size={iconSize} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Underline size={iconSize} />
        </Button>
      </div>

      {/* Alignment Group */}
      <div className="flex items-center gap-1 px-3 border-r border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <AlignLeft size={iconSize} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <AlignCenter size={iconSize} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <AlignRight size={iconSize} />
        </Button>
      </div>

      {/* Structure Group */}
      <div className="flex items-center gap-1 px-3 border-r border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Heading1 size={iconSize} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <List size={iconSize} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Code size={iconSize} />
        </Button>
      </div>

      {/* Insert Group */}
      <div className="flex items-center gap-1 pl-3">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Link size={iconSize} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Image size={iconSize} />
        </Button>
      </div>
    </div>
  );
}