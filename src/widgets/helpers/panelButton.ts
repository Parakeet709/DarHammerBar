// Copyright 2024 Glen Reesor
//
// This file is part of HammerBar.
//
// HammerBar is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or (at your
// option) any later version.
//
// HammerBar is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
// details.
//
// You should have received a copy of the GNU General Public License along with
// HammerBar. If not, see <https://www.gnu.org/licenses/>.

import type { WidgetBuilderParams } from 'src/panel';

type ImageInfo =
  | { bundleId: string; imagePath?: undefined }
  | { bundleId?: undefined; imagePath: string };

export function getPanelButton({
  coords,
  height,
  panelColor,
  panelHoverColor,
  imageInfo,
  onClick,
}: WidgetBuilderParams & { imageInfo: ImageInfo; onClick: () => void }) {
  function cleanupPriorToDelete() {
    state.canvas?.hide();
    state.canvas = undefined;
  }

  const mouseCallback: hs.CanvasMouseCallbackType = function (
    this: void,
    _canvas: hs.CanvasType,
    msg: 'mouseEnter' | 'mouseExit' | 'mouseDown' | 'mouseUp',
  ) {
    if (msg === 'mouseEnter') {
      state.mouseIsInsideButton = true;
      render();
    } else if (msg === 'mouseExit') {
      state.mouseIsInsideButton = false;
      state.mouseButtonIsDown = false;
      render();
    } else if (msg === 'mouseDown') {
      state.mouseButtonIsDown = true;
      render();
    } else if (msg === 'mouseUp') {
      state.mouseButtonIsDown = false;
      render();
      onClick();
    }
  };

  function render() {
    const IMAGE_PADDING = 2;
    const normalImageWidth = width - 2 * IMAGE_PADDING;

    const image =
      imageInfo.bundleId !== undefined
        ? hs.image.imageFromAppBundle(imageInfo.bundleId)
        : hs.image.imageFromPath(imageInfo.imagePath);

    const bgColor = state.mouseIsInsideButton ? panelHoverColor : panelColor;

    const imageWidth = state.mouseButtonIsDown
      ? 0.8 * normalImageWidth
      : normalImageWidth;

    const imageX = state.mouseButtonIsDown
      ? IMAGE_PADDING + 0.1 * normalImageWidth
      : IMAGE_PADDING;

    state.canvas?.replaceElements([
      {
        type: 'rectangle',
        fillColor: bgColor,
        strokeColor: bgColor,
        frame: {
          x: 0,
          y: 0,
          w: height,
          h: height,
        },
        trackMouseEnterExit: true,
        trackMouseDown: true,
        trackMouseUp: true,
      },
      {
        type: 'image',
        frame: {
          x: imageX,
          y: (height - imageWidth) / 2,
          w: imageWidth,
          h: imageWidth,
        },
        image,
        trackMouseEnterExit: true,
        trackMouseDown: true,
        trackMouseUp: true,
      },
    ]);
  }

  const state: {
    canvas: hs.CanvasType | undefined;
    mouseButtonIsDown: boolean;
    mouseIsInsideButton: boolean;
  } = {
    canvas: undefined,
    mouseButtonIsDown: false,
    mouseIsInsideButton: false,
  };

  const width = height;
  state.canvas = hs.canvas.new({
    x: coords.x,
    y: coords.y,
    w: width,
    h: height,
  });

  render();
  state.canvas.mouseCallback(mouseCallback);
  state.canvas.show();

  return {
    bringToFront: () => state.canvas?.show(),
    cleanupPriorToDelete,
    hide: () => state.canvas?.hide(),
    show: () => state.canvas?.show(),
  };
}
