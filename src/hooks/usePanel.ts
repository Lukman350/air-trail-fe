import { PANEL_LIST } from '@/utils/contants';
import { type LucideProps } from 'lucide-react';
import { create } from 'zustand';

interface PanelState {
  panels: IPanel[];
  isPanelToggled: (panel: IPanel) => boolean;
  togglePanel: (panel: IPanel) => void;
}

export interface IPanel {
  id: number;
  title: string;
  opened: boolean;
  children?: () => React.JSX.Element;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
}

const usePanel = create<PanelState>()((set, get) => ({
  panels: PANEL_LIST,
  isPanelToggled: (panel) => panel.opened,
  togglePanel: (panel) =>
    set({
      panels: get().panels.map((p) => {
        if (p.id === panel.id) {
          p.opened = !p.opened;
          return panel;
        }

        p.opened = false;
        return p;
      }),
    }),
}));

export default usePanel;
