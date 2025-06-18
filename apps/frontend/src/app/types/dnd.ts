export interface DraggableItem {
  id: string;
  content: React.ReactNode;
  order: number;
}

export interface DNDContainerProps {
  children: React.ReactNode;
  onReorder?: (items: DraggableItem[]) => void;
  className?: string;
}

export interface DraggableObjectProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}