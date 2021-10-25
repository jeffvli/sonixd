/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
// Resize derived from @nimrod-cohen https://gitter.im/rsuite/rsuite?at=5e1cd3f165540a529a0f5deb
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { DOMHelper } from 'rsuite';
import { useAppSelector } from '../../redux/hooks';
import PageLoader from '../loader/PageLoader';
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
    isModal,
    handleDragEnd,
    dnd,
    miniView,
    disabledContextMenuOptions,
    handleFavorite,
    handleRating,
    ...rest
  }: any,
  ref: any
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState('');
  const [dragSpeed, setDragSpeed] = useState('');
  const [height, setHeight] = useState(0);
  const [show, setShow] = useState(false);
  // const [scrollY, setScrollY] = useState(0);
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
        // tableRef?.current?.scrollTop(Math.abs(scrollY));
      }, 500);

      setHeight(wrapperRef.current ? getHeight(wrapperRef.current) : 200);
    }

    if (!miniView) {
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
    return undefined;
  }, [getHeight, miniView]);

  useEffect(() => {
    if (!isModal) {
      window.requestAnimationFrame(() => {
        setHeight(wrapperRef.current ? getHeight(wrapperRef.current) : 200);
        setShow(true);
      });
    } else {
      setTimeout(() => {
        window.requestAnimationFrame(() => {
          setHeight(wrapperRef.current ? getHeight(wrapperRef.current) : 200);
          setShow(true);
        });
      }, 250);
    }
  }, [getHeight, isModal]);

  useEffect(() => {
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
      case 'fastest':
        scrollDistance = 240;
        break;
      default:
        scrollDistance = 15;
        break;
    }

    if (isDragging) {
      const interval = setInterval(() => {
        const currentScrollY = Math.abs(tableRef?.current.scrollY);
        const currentScrollX = Math.abs(tableRef?.current.scrollX);
        if (dragDirection.match(/down|up/)) {
          tableRef.current.scrollTop(
            dragDirection === 'down'
              ? currentScrollY + scrollDistance
              : dragDirection === 'up' && currentScrollY - scrollDistance > 0
              ? currentScrollY - scrollDistance
              : 0
          );
        }

        if (dragDirection.match(/left|right/)) {
          tableRef.current.scrollLeft(
            dragDirection === 'right'
              ? currentScrollX + 60
              : dragDirection === 'left' && currentScrollX - 60 > 0
              ? currentScrollX - 60
              : 0
          );
        }

        // setScrollY(currentScroll);
      }, 20);

      return () => clearInterval(interval);
    }
    return () => clearInterval();
  }, [dragDirection, dragSpeed, isDragging]);

  return (
    <>
      {!show && <PageLoader />}
      <div
        style={{
          flexGrow: 1,
          height: '100%',
          cursor: isDragging ? 'all-scroll' : 'default',
        }}
        ref={wrapperRef}
        onMouseDown={(e) => {
          e.preventDefault();
          if (e.button === 1) {
            setIsDragging(true);
          }
          if (e.button === 0 && isDragging) {
            setIsDragging(false);
          }
        }}
      >
        <div
          id="scroll-top"
          style={{
            position: 'absolute',
            height: '40%',
            width: '90%',
            top: 0,
            left: '5%',
            right: 0,
            zIndex: isDragging ? 1 : undefined,
          }}
          onMouseEnter={() => {
            setDragDirection('up');
          }}
          onMouseLeave={() => {
            setDragDirection('none');
          }}
        >
          <div
            id="scroll-top-fastest"
            style={{ height: 'calc(100% / 4)' }}
            onMouseEnter={() => {
              setDragSpeed('fastest');
            }}
          />
          <div
            id="scroll-top-fast"
            style={{ height: 'calc(100% / 4)' }}
            onMouseEnter={() => {
              setDragSpeed('fast');
            }}
          />
          <div
            id="scroll-top-medium"
            style={{ height: 'calc(100% / 4)' }}
            onMouseEnter={() => {
              setDragSpeed('medium');
            }}
          />
          <div
            id="scroll-top-slow"
            style={{ height: 'calc(100% / 4)' }}
            onMouseEnter={() => {
              setDragSpeed('slow');
            }}
          />
        </div>
        <div
          id="scroll-left"
          style={{
            position: 'absolute',
            height: '100%',
            width: '5%',
            top: 0,
            left: 0,
            zIndex: isDragging ? 1 : undefined,
          }}
          onMouseEnter={() => {
            setDragDirection('left');
          }}
          onMouseLeave={() => {
            setDragDirection('none');
          }}
        />
        <div
          id="scroll-right"
          style={{
            position: 'absolute',
            height: '100%',
            width: '5%',
            top: 0,
            right: 0,
            zIndex: isDragging ? 1 : undefined,
          }}
          onMouseEnter={() => {
            setDragDirection('right');
          }}
          onMouseLeave={() => {
            setDragDirection('none');
          }}
        />
        <div
          id="scroll-neutral"
          style={{
            position: 'absolute',
            height: '20%',
            width: '90%',
            top: '40%',
            left: '5%',
            right: 0,
            zIndex: isDragging ? 1 : undefined,
          }}
          onMouseEnter={() => {
            setDragDirection('none');
          }}
        />
        <div
          id="scroll-bottom"
          style={{
            position: 'absolute',
            height: '40%',
            width: '90%',
            bottom: 0,
            left: '5%',
            right: 0,
            zIndex: isDragging ? 1 : undefined,
          }}
          onMouseEnter={() => {
            setDragDirection('down');
          }}
          onMouseLeave={() => {
            setDragDirection('none');
          }}
        >
          <div
            id="scroll-bottom-slow"
            style={{ height: 'calc(100% / 4)' }}
            onMouseEnter={() => {
              setDragSpeed('slow');
            }}
          />
          <div
            id="scroll-bottom-medium"
            style={{ height: 'calc(100% / 4)' }}
            onMouseEnter={() => {
              setDragSpeed('medium');
            }}
          />
          <div
            id="scroll-bottom-fast"
            style={{ height: 'calc(100% / 4)' }}
            onMouseEnter={() => {
              setDragSpeed('fast');
            }}
          />
          <div
            id="scroll-bottom-fastest"
            style={{ height: 'calc(100% / 4)' }}
            onMouseEnter={() => {
              setDragSpeed('fastest');
            }}
          />
        </div>

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
            playlist={rest.playlist}
            isModal={isModal}
            handleDragEnd={handleDragEnd}
            dnd={dnd}
            miniView={miniView}
            disabledContextMenuOptions={disabledContextMenuOptions}
            handleFavorite={handleFavorite}
            handleRating={handleRating}
            // onScroll={(e) => setScrollY(tableRef.current.scrollY)}
          />
        )}
      </div>
    </>
  );
};

export default forwardRef(ListViewType);
