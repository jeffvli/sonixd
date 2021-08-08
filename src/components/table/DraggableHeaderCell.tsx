import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Table } from 'rsuite';

const ItemTypes = {
  COLUMN: 'column',
  ROW: 'row',
};

const DraggableHeaderCell = ({ children, onDrag, id, ...rest }: any) => {
  const ref = React.useRef(null);

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: ItemTypes.COLUMN,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    drop(item: any) {
      onDrag(item.id, id);
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.COLUMN,
    item: { id, type: ItemTypes.COLUMN },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const isActive = canDrop && isOver;

  drag(drop(ref));

  return (
    <Table.HeaderCell {...rest} style={{ padding: 0 }}>
      <div
        ref={ref}
        style={{
          opacity: isDragging ? 0 : 1,
          backgroundColor: isActive ? '#3B4552' : undefined,
        }}
      >
        {children}
      </div>
    </Table.HeaderCell>
  );
};

export default DraggableHeaderCell;
