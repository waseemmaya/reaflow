import React, { forwardRef, Ref, useState } from 'react';
import { motion } from 'framer-motion';
import { PortData } from '../../types';
import {
  NodeDragEvents,
  DragEvent,
  useNodeDrag,
  Position
} from '../../utils/useNodeDrag';
import css from './Port.module.scss';
import classNames from 'classnames';
import { useCanvas } from '../../utils/CanvasProvider';

export interface ElkPortProperties {
  index: number;
  width: number;
  height: number;
  'port.side': string;
  'port.alignment': string;
}

export interface PortProps extends NodeDragEvents<PortData> {
  id: string;
  x: number;
  y: number;
  rx: number;
  ry: number;
  offsetX: number;
  offsetY: number;
  disabled?: boolean;
  className?: string;
  properties: ElkPortProperties & PortData;
  style?: any;
  active?: boolean;
  onEnter?: (
    event: React.MouseEvent<SVGGElement, MouseEvent>,
    port: PortData
  ) => void;
  onLeave?: (
    event: React.MouseEvent<SVGGElement, MouseEvent>,
    port: PortData
  ) => void;
  onClick?: (
    event: React.MouseEvent<SVGGElement, MouseEvent>,
    port: PortData
  ) => void;
}

export const Port = forwardRef(
  (
    {
      x,
      y,
      rx,
      ry,
      disabled,
      style,
      properties,
      offsetX,
      offsetY,
      className,
      active,
      onDrag = () => undefined,
      onDragStart = () => undefined,
      onDragEnd = () => undefined,
      onEnter = () => undefined,
      onLeave = () => undefined,
      onClick = () => undefined
    }: Partial<PortProps>,
    ref: Ref<SVGRectElement>
  ) => {
    const { readonly } = useCanvas();
    const [dragging, setDragging] = useState<boolean>(false);
    const [hovered, setHovered] = useState<boolean>(false);
    const newX = x - properties.width / 2;
    const newY = y - properties.height / 2;

    const onDragStartInternal = (event: DragEvent, initial: Position) => {
      onDragStart(event, initial, properties);
      setDragging(true);
    };

    const onDragEndInternal = (event: DragEvent, initial: Position) => {
      onDragEnd(event, initial, properties);
      setDragging(false);
    };

    const bind = useNodeDrag({
      x: newX + offsetX,
      y: newY + offsetY,
      height: properties.height,
      width: properties.width,
      disabled: disabled || readonly,
      node: properties,
      onDrag,
      onDragStart: onDragStartInternal,
      onDragEnd: onDragEndInternal
    });

    if (properties.hidden) {
      return null;
    }

    return (
      <g>
        <rect
          {...bind()}
          ref={ref}
          height={properties.height + 14}
          width={properties.width + 14}
          x={newX - 7}
          y={newY - 7}
          className={css.clicker}
          onMouseEnter={(event) => {
            event.stopPropagation();
            setHovered(true);
            onEnter(event, properties);
          }}
          onMouseLeave={(event) => {
            event.stopPropagation();
            setHovered(false);
            onLeave(event, properties);
          }}
          onClick={(event) => {
            event.stopPropagation();
            onClick(event, properties);
          }}
        />
        <motion.rect
          key={`${x}-${y}`}
          style={style}
          className={classNames(css.port, className, properties?.className)}
          height={properties.height}
          width={properties.width}
          rx={rx}
          ry={ry}
          initial={{
            scale: 0,
            opacity: 0,
            x: newX,
            y: newY
          }}
          animate={{
            x: newX,
            y: newY,
            scale: dragging || active || hovered ? 1.5 : 1,
            opacity: 1
          }}
        />
      </g>
    );
  }
);
