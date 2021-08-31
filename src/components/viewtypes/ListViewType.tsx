// Resize derived from @nimrod-cohen https://gitter.im/rsuite/rsuite?at=5e1cd3f165540a529a0f5deb
import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { DOMHelper } from 'rsuite';
import { useAppSelector } from '../../redux/hooks';
import Loader from '../loader/Loader';
import SelectionBar from '../selectionbar/SelectionBar';
import ListViewTable from './ListViewTable';

declare global {
  interface Window {
    resizeInterval: any;
  }
}

const ListViewType = (
  {
    data,
    handleRowClick,
    handleRowDoubleClick,
    tableColumns,
    hasDraggableColumns,
    rowHeight,
    virtualized,
    fontSize,
    cacheImages,
    children,
    listType,
    ...rest
  }: any,
  ref: any
) => {
  // const [isDragging, setIsDragging] = useState(false);
  // const [dragDirection, setDragDirection] = useState('down');
  // const [dragSpeed, setDragSpeed] = useState('medium');
  const [height, setHeight] = useState(0);
  const [show, setShow] = useState(false);
  const [columns] = useState(tableColumns);
  const { getHeight } = DOMHelper;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const multiSelect = useAppSelector((state: any) => state.multiSelect);
  const playQueue = useAppSelector((state: any) => state.playQueue);

  const tableRef = useRef<any>();
  useImperativeHandle(ref, () => ({
    get table() {
      return tableRef;
    },
  }));

  useEffect(() => {
    function handleResize() {
      setShow(false);
      window.clearTimeout(window.resizeInterval);
      window.resizeInterval = window.setTimeout(() => {
        setShow(true);
      }, 500);

      setHeight(wrapperRef.current ? getHeight(wrapperRef.current) : 200);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [getHeight]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      setHeight(wrapperRef.current ? getHeight(wrapperRef.current) : 200);
      setShow(true);
    });
  }, [getHeight]);

  /* useEffect(() => {
    let scrollDistance = 0;
    switch (dragSpeed) {
      case 'slow':
        scrollDistance = 15;
        break;
      case 'medium':
        scrollDistance = 30;
        break;
      case 'fast':
        scrollDistance = 60;
        break;
      default:
        scrollDistance = 15;
        break;
    }

    if (isDragging) {
      const interval = setInterval(() => {
        const currentScroll = Math.abs(tableRef?.current.scrollY);
        tableRef.current.scrollTop(
          dragDirection === 'down'
            ? currentScroll + scrollDistance
            : dragDirection === 'up' && currentScroll - scrollDistance > 0
            ? currentScroll - scrollDistance
            : 0
        );
      }, 50);

      return () => clearInterval(interval);
    }
    return () => clearInterval();
  }, [dragDirection, dragSpeed, isDragging]); */

  return (
    <>
      {!show && <Loader />}
      {multiSelect.selected.length >= 1 && (
        <SelectionBar
          handleUpClick={rest.handleUpClick}
          handleDownClick={rest.handleDownClick}
          handleManualClick={rest.handleManualClick}
        />
      )}

      {/* <Button onClick={() => tableRef.current.scrollTop(16000)}>Scroll</Button> */}
      {/* <Button onClick={() => console.log(tableRef.current)}>Info</Button> */}
      {/* <div
        style={{ position: 'absolute', left: '50%', top: '200px', zIndex: 1 }}
      >
        <div>Direction: {dragDirection}</div>
        <div>IsDragging: {isDragging ? 'true' : 'false'}</div>
        <div>DragSpeed: {dragSpeed}</div>
      </div> */}

      <div style={{ flexGrow: 1, height: '100%' }} ref={wrapperRef}>
        {/* <div
          id="scroll-top"
          style={{
            position: 'absolute',
            background: 'blue',
            height: '15%',
            width: '100%',
            top: 0,
            left: 0,
            right: 0,
            zIndex: isDragging ? 1 : undefined,
          }}
          onMouseEnter={() => {
            console.log('panning down');
            setIsDragging(true);
            setDragDirection('up');
          }}
          onMouseLeave={() => {
            console.log('stopped panning down');
            setIsDragging(false);
            setDragDirection('none');
          }}
        >
          <div
            id="scroll-top-fast"
            style={{ height: 'calc(100% / 3)', background: 'green' }}
            onMouseEnter={() => {
              setDragSpeed('fast');
            }}
          />
          <div
            id="scroll-top-medium"
            style={{ height: 'calc(100% / 3)', background: 'blue' }}
            onMouseEnter={() => {
              setDragSpeed('medium');
            }}
          />
          <div
            id="scroll-top-slow"
            style={{ height: 'calc(100% / 3)', background: 'red' }}
            onMouseEnter={() => {
              setDragSpeed('slow');
            }}
          />
        </div>
        <div
          id="scroll-bottom"
          style={{
            position: 'absolute',
            background: 'red',
            height: '15%',
            width: '100%',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: isDragging ? 1 : undefined,
          }}
          onMouseEnter={() => {
            console.log('panning down');
            setIsDragging(true);
            setDragDirection('down');
          }}
          onMouseLeave={() => {
            console.log('stopped panning down');
            setIsDragging(false);
            setDragDirection('none');
          }}
        >
          <div
            id="scroll-bottom-slow"
            style={{ height: 'calc(100% / 3)', background: 'red' }}
            onMouseEnter={() => {
              setDragSpeed('slow');
            }}
          />
          <div
            id="scroll-bottom-medium"
            style={{ height: 'calc(100% / 3)', background: 'blue' }}
            onMouseEnter={() => {
              setDragSpeed('medium');
            }}
          />
          <div
            id="scroll-bottom-fast"
            style={{ height: 'calc(100% / 3)', background: 'green' }}
            onMouseEnter={() => {
              setDragSpeed('fast');
            }}
          />
        </div> */}

        {show && (
          <ListViewTable
            tableRef={tableRef}
            height={height}
            data={data}
            virtualized
            rowHeight={rowHeight}
            fontSize={fontSize}
            columns={columns}
            handleRowClick={handleRowClick}
            handleRowDoubleClick={handleRowDoubleClick}
            playQueue={playQueue}
            multiSelect={multiSelect}
            cacheImages={cacheImages}
            listType={listType}
            nowPlaying={rest.nowPlaying}
          />
        )}
      </div>
    </>
  );
};

export default forwardRef(ListViewType);
