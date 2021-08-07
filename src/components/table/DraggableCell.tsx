import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Table } from 'rsuite';

const ItemTypes = {
  COLUMN: 'column',
  ROW: 'row',
};

const DraggableCell = ({ children, onDrag, id, rowData, ...rest }: any) => {
  const ref = React.useRef(null);

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: ItemTypes.ROW,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    drop(item: any) {
      onDrag(item.id, rowData.id);
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ROW,
    item: { id: rowData.id, type: ItemTypes.ROW },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const isActive = canDrop && isOver;

  drag(drop(ref));

  const styles = {
    opacity: isDragging ? 0.5 : 1,
    background: isActive ? '#ddd' : undefined,
  };

  return (
    <Table.Cell {...rest} style={{ padding: 0 }}>
      <div ref={ref} style={styles}>
        {children}
      </div>
    </Table.Cell>
  );
};

export default DraggableCell;
