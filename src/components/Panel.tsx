import type { IPanel } from '@/hooks/usePanel';
import usePanel from '@/hooks/usePanel';
import { X } from 'lucide-react';

interface PanelProps {
  panel: IPanel;
}

export default function Panel({ panel, ...props }: PanelProps) {
  const { isPanelToggled, togglePanel } = usePanel();

  return (
    <div
      className={`absolute left-20 xl:left-28 bottom-6 ${
        isPanelToggled(panel) ? 'translate-x-0' : '-translate-x-[1000px]'
      } transition duration-300 shadow-lg z-[1000] p-4 w-[250px] md:w-[400px] bg-background rounded`}
      {...props}
    >
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-sm md:text-lg font-bold">{panel.title}</h2>
        <button onClick={() => togglePanel(panel)} className="cursor-pointer hover:bg-background">
          <X className="hover:text-red-500 size-4 xl:size-6" />
        </button>
      </div>

      {panel.children && <panel.children />}
    </div>
  );
}
