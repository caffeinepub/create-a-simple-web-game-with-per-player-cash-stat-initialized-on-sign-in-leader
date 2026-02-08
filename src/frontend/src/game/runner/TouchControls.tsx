import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';

interface TouchControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onJump: () => void;
  onSlide: () => void;
  disabled: boolean;
}

export default function TouchControls({
  onMoveLeft,
  onMoveRight,
  onJump,
  onSlide,
  disabled,
}: TouchControlsProps) {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 pointer-events-none">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-end justify-between gap-4 pointer-events-auto">
          {/* Left/Right Controls */}
          <div className="flex gap-2">
            <Button
              size="lg"
              variant="secondary"
              className="h-16 w-16 rounded-full shadow-lg bg-card/90 backdrop-blur-sm hover:bg-card border-2 border-border"
              onClick={onMoveLeft}
              disabled={disabled}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="h-16 w-16 rounded-full shadow-lg bg-card/90 backdrop-blur-sm hover:bg-card border-2 border-border"
              onClick={onMoveRight}
              disabled={disabled}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          </div>

          {/* Jump/Slide Controls */}
          <div className="flex gap-2">
            <Button
              size="lg"
              variant="secondary"
              className="h-16 w-16 rounded-full shadow-lg bg-card/90 backdrop-blur-sm hover:bg-card border-2 border-border"
              onClick={onSlide}
              disabled={disabled}
            >
              <ArrowDown className="w-8 h-8" />
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="h-16 w-16 rounded-full shadow-lg bg-card/90 backdrop-blur-sm hover:bg-card border-2 border-border"
              onClick={onJump}
              disabled={disabled}
            >
              <ArrowUp className="w-8 h-8" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
