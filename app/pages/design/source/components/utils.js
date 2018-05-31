import _ from 'lodash';

export function nearToLine(source) {
  let {x: sx, y: sy, width: swidth, height: sheight} = source[0];
  let {x: ex, y: ey, width: ewidth, height: eheight} = source[1];

  let agTop, agLeft, agRight, agBottom, sDirect, eDirect;
  const sTopX = sx + swidth / 2,
    sBottomX = sx + swidth / 2,
    sTopY = sy,
    sLeftX = sx,
    sLeftY = sy + sheight / 2,
    sRightY = sy + sheight / 2,
    sRightX = sx + swidth,
    sBottomY = sy + sheight;
  const eBottomX = ex + ewidth / 2,
    eTopX = ex + ewidth / 2,
    eBottomY = ey + eheight,
    eRightX = ex + ewidth,
    eRightY = ey + eheight / 2,
    eLeftY = ey + eheight / 2,
    eLeftX = ex,
    eTopY = ey;

  agTop = Math.atan(Math.abs((sTopX - eBottomX)) / (sTopY - eBottomY));
  agLeft = Math.atan(Math.abs((eRightY - sLeftY)) / (sLeftX - eRightX));
  agRight = Math.atan(Math.abs((eLeftY - sRightY)) / (eLeftX - sRightX));
  agBottom = Math.atan(Math.abs((eTopX - sBottomX)) / (eTopY - sBottomY));

  const minAg = _.min([agTop, agLeft, agRight, agBottom].filter(n => n >= 0));

  if (minAg === agTop) {
    sx = sTopX;
    ex = eBottomX;
    ey = eBottomY;
    sDirect = 'top';
    eDirect = 'bottom';
  } else if (minAg === agLeft) {
    sy = sLeftY;
    ex = eRightX;
    ey = eRightY;
    sDirect = 'left';
    eDirect = 'right';
  } else if (minAg === agRight) {
    sx = sRightX;
    sy = sRightY;
    ey = eLeftY;
    sDirect = 'right';
    eDirect = 'left';
  } else if (minAg === agBottom) {
    sx = sBottomX;
    sy = sBottomY;
    ex = eTopX;
    sDirect = 'bottom';
    eDirect = 'top';
  } else if (sLeftX >= eBottomX && sLeftY < eRightY) {
    sx = sLeftX;
    sy = sLeftY;
    ex = eTopX;
    sDirect = 'left';
    eDirect = 'top';
  } else if (sTopX >= eRightX && sTopY >= eRightY) {
    sx = sTopX;
    ex = eRightX;
    ey = eRightY;
    sDirect = 'top';
    eDirect = 'right';
  } else if (sTopX < eLeftX && sTopY >= eLeftY) {
    sx = sTopX;
    ex = eLeftX;
    ey = eLeftY;
    sDirect = 'top';
    eDirect = 'left';
  } else if (sRightX < eTopX && sRightY < eTopY) {
    sx = sRightX;
    sy = sRightY;
    ex = eTopX;
    sDirect = 'right';
    eDirect = 'top';
  }

  return {sx, sy, ex, ey, sDirect, eDirect};
}

export function arrowLine([[sx, sy], [ex, ey]]) {
  const arrowAgenle = 20 * Math.PI / 180;
  const arrowLength = 8;


  const x = ex - sx;
  const y = ey - sy;

  let arrow1X = Math.cos(Math.atan(Math.abs(y / x)) - arrowAgenle) * arrowLength;
  let arrow1Y = Math.sin(Math.atan(Math.abs(y / x)) - arrowAgenle) * arrowLength;

  arrow1X = (x > 0 ? (0 - arrow1X) : arrow1X) + ex;
  arrow1Y = (y > 0 ? (0 - arrow1Y) : arrow1Y) + ey;

  let arrow2X = Math.sin(Math.atan(Math.abs(x / y)) - arrowAgenle) * arrowLength;
  let arrow2Y = Math.cos(Math.atan(Math.abs(x / y)) - arrowAgenle) * arrowLength;

  arrow2X = (x > 0 ? (0 - arrow2X) : arrow2X) + ex;
  arrow2Y = (y > 0 ? (0 - arrow2Y) : arrow2Y) + ey;

  return [[[arrow1X, arrow1Y], [ex, ey]], [[arrow2X, arrow2Y], [ex, ey]]];
}

export function getLineRect(line, width = 5) {
  let [[sx, sy], [ex, ey]] = line;
  const angle = Math.atan(Math.abs((ey - sy) / (ex - sx)));
  const ox = Math.sin(angle) * width;
  const oy = Math.cos(angle) * width;

  if ((sx >= ex && sy >= ey) || (sx < ex && sy >= ey)) {
    [sx, ex] = [ex, sx];
    [sy, ey] = [ey, sy];
  }
  if (sx > ex) {
    return [[sx - ox, sy - oy], [sx + ox, sy + oy], [ex + ox, ey + oy], [ex - ox, ey - oy]];
  } else {
    return [[sx - ox, sy + oy], [sx + ox, sy - oy], [ex + ox, ey - oy], [ex - ox, ey + oy]];
  }
}
