var rectangle = document.getElementsByClassName("button-rectangle")[0];
var ellipse = document.getElementsByClassName("button-ellipse")[0];
var canvasContent = document.getElementsByClassName("canvas-content")[0];
var shapesInfo = []; //存储canvas中的所有图形信息
var ctx = getCanvas();
var shapeStore = [];
var startCoordinate = {};
var currentShape;
var drawingShape;
//鼠标行为属性
var mouseAction = {
    canStart: false,
    canDraw: false,
    canChangeMouseType: false,
    canResize: false,
    canAdjust: false
};

function getCanvas() {
    var c = canvasContent.getContext("2d");
    c.lineWidth = 2;
    c.strokeStyle = "red";
    c.save();
    return c;
}

rectangle.onclick = function() {
    mouseAction.canStart = true;
    drawingShape = "rectangle";
};

ellipse.onclick = function() {
    mouseAction.canStart = true;
    drawingShape = "ellipse";
}


canvasContent.onmousedown = function(event) {
    //鼠标按下时的坐标
    setStartCoordinate(event.offsetX, event.offsetY);
    if (mouseAction.canStart) {
        mouseAction.canDraw = true;
    }
    if (mouseAction.canResize && (getMouseAction() != "default")) {
        mouseAction.canAdjust = true;
        currentShape = getActiveShape();
    }
    if (getMouseAction() == "default") {
        mouseAction.canResize = false;
        mouseAction.canAdjust = false;
        mouseAction.canStart = true;
        changeMouseType("crosshair");
        mouseAction.canChangeMouseType = false;
        var shape = shapesInfo[shapesInfo.length - 1];
        ctx.clearRect(shape.left - 7, shape.top - 7, shape.width + 14, shape.height + 14);
        if (drawingShape == "rectangle") {
            ctx.strokeRect(shape.left, shape.top, shape.width, shape.height);
        } else if (drawingShape == "ellipse") {
            drawEllipse(shape);
        }
    }
};

function setStartCoordinate(xCoordinate, yCoordinate) {
    startCoordinate.x = xCoordinate;
    startCoordinate.y = yCoordinate;
}

canvasContent.onmousemove = function(event) {
    mouseMoveAction(event);
};

//鼠标move时的行为
function mouseMoveAction(event) {
    var currentCoordinate = {
        x: event.offsetX,
        y: event.offsetY
    };
    if (mouseAction.canStart && mouseAction.canDraw) {
        var rect = calculateShapeInfo(startCoordinate, currentCoordinate);
        shapeStore.push(rect);
        redraw(shapeStore, drawingShape);
    };
    if (mouseAction.canAdjust) {
        if (shapeStore.length == 0) {
            ctx.clearRect(currentShape.left - 7, currentShape.top - 7, currentShape.width + 14, currentShape.height + 14);
        }
        var moveDistance = {};
        moveDistance.x = currentCoordinate.x - startCoordinate.x;
        moveDistance.y = currentCoordinate.y - startCoordinate.y;
        var nextShape = {};
        var minDistance = 8;
        if (getMouseAction() == "move") {
            nextShape.left = currentShape.left + moveDistance.x;
            nextShape.top = currentShape.top + moveDistance.y;
            nextShape.width = currentShape.width;
            nextShape.height = currentShape.height;
        } else if (getMouseAction() == "n-resize") {
            if (currentShape.height - moveDistance.y <= minDistance) {
                changeMouseType("n-resize");
                mouseAction.canChangeMouseType = false;
            } else {
                mouseAction.canChangeMouseType = true;
            }
            nextShape.left = currentShape.left;
            nextShape.top = Math.min(currentShape.top + moveDistance.y, currentShape.top + currentShape.height - minDistance);
            nextShape.width = currentShape.width;
            nextShape.height = Math.max(currentShape.height - moveDistance.y, minDistance);
        } else if (getMouseAction() == "s-resize") {
            if (currentShape.height + moveDistance.y <= minDistance) {
                changeMouseType("s-resize");
                mouseAction.canChangeMouseType = false;
            } else {
                mouseAction.canChangeMouseType = true;
            }
            nextShape.left = currentShape.left;
            nextShape.top = currentShape.top;
            nextShape.width = currentShape.width;
            nextShape.height = Math.max(currentShape.height + moveDistance.y, minDistance);
        } else if (getMouseAction() == "w-resize") {
            if (currentShape.width - moveDistance.x <= minDistance) {
                changeMouseType("w-resize");
                mouseAction.canChangeMouseType = false;
            } else {
                mouseAction.canChangeMouseType = true;
            }
            nextShape.left = Math.min(currentShape.left + moveDistance.x, currentShape.left + currentShape.width - minDistance);
            nextShape.top = currentShape.top;
            nextShape.width = Math.max(currentShape.width - moveDistance.x, minDistance);
            nextShape.height = currentShape.height;
        } else if (getMouseAction() == "e-resize") {
            if (currentShape.width + moveDistance.x <= minDistance) {
                changeMouseType("e-resize");
                mouseAction.canChangeMouseType = false;
            } else {
                mouseAction.canChangeMouseType = true;
            }
            nextShape.left = currentShape.left;
            nextShape.top = currentShape.top;
            nextShape.width = Math.max(currentShape.width + moveDistance.x, minDistance);
            nextShape.height = currentShape.height;
        } else if (getMouseAction() == "ne-resize") {
            if ((currentShape.width + moveDistance.x <= minDistance) || (currentShape.height - moveDistance.y <= minDistance)) {
                changeMouseType("ne-resize");
                mouseAction.canChangeMouseType = false;
            } else {
                mouseAction.canChangeMouseType = true;
            }
            nextShape.left = currentShape.left;
            nextShape.top = Math.min(currentShape.top + moveDistance.y, currentShape.top + currentShape.height - minDistance);
            nextShape.width = Math.max(currentShape.width + moveDistance.x, minDistance);
            nextShape.height = Math.max(currentShape.height - moveDistance.y, minDistance);
        } else if (getMouseAction() == "se-resize") {
            if ((currentShape.width + moveDistance.x <= minDistance) || (currentShape.height + moveDistance.y <= minDistance)) {
                changeMouseType("se-resize");
                mouseAction.canChangeMouseType = false;
            } else {
                mouseAction.canChangeMouseType = true;
            }
            nextShape.left = currentShape.left;
            nextShape.top = currentShape.top;
            nextShape.width = Math.max(currentShape.width + moveDistance.x, minDistance);
            nextShape.height = Math.max(currentShape.height + moveDistance.y, minDistance);
        } else if (getMouseAction() == "nw-resize") {
            if ((currentShape.width - moveDistance.x <= minDistance) || (currentShape.height - moveDistance.y <= minDistance)) {
                changeMouseType("nw-resize");
                mouseAction.canChangeMouseType = false;
            } else {
                mouseAction.canChangeMouseType = true;
            }
            nextShape.left = Math.min(currentShape.left + moveDistance.x, currentShape.left + currentShape.width - minDistance);
            nextShape.top = Math.min(currentShape.top + moveDistance.y, currentShape.top + currentShape.height - minDistance);
            nextShape.width = Math.max(currentShape.width - moveDistance.x, minDistance);
            nextShape.height = Math.max(currentShape.height - moveDistance.y, minDistance);
        } else if (getMouseAction() == "sw-resize") {
            if ((currentShape.width - moveDistance.x <= minDistance) || (currentShape.height + moveDistance.y <= minDistance)) {
                changeMouseType("sw-resize");
                mouseAction.canChangeMouseType = false;
            } else {
                mouseAction.canChangeMouseType = true;
            }
            nextShape.left = Math.min(currentShape.left + moveDistance.x, currentShape.left + currentShape.width - minDistance);
            nextShape.top = currentShape.top;
            nextShape.width = Math.max(currentShape.width - moveDistance.x, minDistance);
            nextShape.height = Math.max(currentShape.height + moveDistance.y, minDistance);
        }

        shapeStore.push(nextShape);
        redraw(shapeStore, drawingShape);

        //鼠标移动时即改变坐标信息，否则鼠标定位时会出错
        shapesInfo[shapesInfo.length - 1].left = shapeStore[0].left;
        shapesInfo[shapesInfo.length - 1].top = shapeStore[0].top;
        shapesInfo[shapesInfo.length - 1].width = shapeStore[0].width;
        shapesInfo[shapesInfo.length - 1].height = shapeStore[0].height;
    }
    if (mouseAction.canChangeMouseType) {
        locateMouse(shapesInfo[shapesInfo.length - 1], event);
    }
};

//获取当前活动的图形
function getActiveShape() {
    if (shapesInfo[shapesInfo.length - 1].scalable == true) {
        return JSON.parse(JSON.stringify(shapesInfo[shapesInfo.length - 1]));
    } else {
        return null;
    }
}

//鼠标松开时触发
canvasContent.onmouseup = function(event) {
    if ((mouseAction.canStart && mouseAction.canDraw) || (mouseAction.canResize && mouseAction.canAdjust)) {
        finishDrawing(shapeStore);
        mouseAction.canChangeMouseType = true;
        mouseAction.canResize = true;
    };
}

//绘制图形
function redraw(shapeStore, shape) {
    //当鼠标移动时，移除上一帧图形
    if (shapeStore[1]) {
        ctx.clearRect(shapeStore[0].left - 1, shapeStore[0].top - 1, shapeStore[0].width + 2, shapeStore[0].height + 2);
        shapeStore.reverse().pop();
    }
    if (shape == "rectangle") {
        ctx.strokeRect(shapeStore[0].left, shapeStore[0].top, shapeStore[0].width, shapeStore[0].height);
    } else if (shape == "ellipse") {
        drawEllipse(shapeStore[0]);
    }
}

function drawEllipse(shapeInfo) {
    var x = shapeInfo.left + shapeInfo.width / 2;
    var y = shapeInfo.top + shapeInfo.height / 2;
    var radiusX = shapeInfo.width / 2;
    var radiusY = shapeInfo.height / 2;
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.stroke();
}

function calculateShapeInfo(start, end) {
    var info = {};
    info.width = Math.abs(end.x - start.x);
    info.height = Math.abs(end.y - start.y);
    info.top = start.y < end.y ? start.y : end.y;
    info.left = start.x < end.x ? start.x : end.x;
    return info;
}

//鼠标松开结束画图
function finishDrawing(shapeStore) {
    var data = shapeStore[0];
    if (mouseAction.canStart && mouseAction.canDraw) {
        mouseAction.canStart = false;
        mouseAction.canDraw = false;
        data.shape = "rectangle";
        data.scalable = true;
        shapesInfo.push(data);
    }
    if (mouseAction.canResize && mouseAction.canAdjust) {
        mouseAction.canResize = false;
        mouseAction.canAdjust = false;
    }
    drawBorder(data);
    shapeStore.length = 0;
}

//定位当前鼠标的位置，用于改变鼠标类型
function locateMouse(shapeInfo, mouse) {
    var dashOffset = 3;
    if ((mouse.offsetX >= shapeInfo.left - dashOffset - 3) && (mouse.offsetX <= shapeInfo.left - dashOffset + 3) && (mouse.offsetY >= shapeInfo.top - dashOffset - 3) && (mouse.offsetY <= shapeInfo.top - dashOffset + 3)) {
        changeMouseType("nw-resize");
    } else if ((mouse.offsetX >= shapeInfo.left + shapeInfo.width + dashOffset - 3) && (mouse.offsetX <= shapeInfo.left + shapeInfo.width + dashOffset + 3) && (mouse.offsetY >= shapeInfo.top - dashOffset - 3) && (mouse.offsetY <= shapeInfo.top - dashOffset + 3)) {
        changeMouseType("ne-resize");
    } else if ((mouse.offsetX >= shapeInfo.left + shapeInfo.width + dashOffset - 3) && (mouse.offsetX <= shapeInfo.left + shapeInfo.width + dashOffset + 3) && (mouse.offsetY >= shapeInfo.top + shapeInfo.height + dashOffset - 3) && (mouse.offsetY <= shapeInfo.top + shapeInfo.height + dashOffset + 3)) {
        changeMouseType("se-resize");
    } else if ((mouse.offsetX >= shapeInfo.left - dashOffset - 3) && (mouse.offsetX <= shapeInfo.left - dashOffset + 3) && (mouse.offsetY >= shapeInfo.top + shapeInfo.height + dashOffset - 3) && (mouse.offsetY <= shapeInfo.top + shapeInfo.height + dashOffset)) {
        changeMouseType("sw-resize");
    } else if ((mouse.offsetX > shapeInfo.left) && (mouse.offsetX < shapeInfo.left + shapeInfo.width) && (mouse.offsetY >= shapeInfo.top - dashOffset) && (mouse.offsetY < shapeInfo.top)) {
        changeMouseType("n-resize");
    } else if ((mouse.offsetX > shapeInfo.left + shapeInfo.width) && (mouse.offsetX <= shapeInfo.left + shapeInfo.width + dashOffset) && (mouse.offsetY > shapeInfo.top) && (mouse.offsetY < shapeInfo.top + shapeInfo.height)) {
        changeMouseType("e-resize");
    } else if ((mouse.offsetX > shapeInfo.left) && (mouse.offsetX < shapeInfo.left + shapeInfo.width) && (mouse.offsetY > shapeInfo.top + shapeInfo.height) && (mouse.offsetY <= shapeInfo.top + shapeInfo.height + dashOffset)) {
        changeMouseType("s-resize");
    } else if ((mouse.offsetX >= shapeInfo.left - dashOffset) && (mouse.offsetX < shapeInfo.left) && (mouse.offsetY > shapeInfo.top) && (mouse.offsetY < shapeInfo.top + shapeInfo.height)) {
        changeMouseType("w-resize");
    } else if ((mouse.offsetX >= shapeInfo.left) && (mouse.offsetX <= shapeInfo.left + shapeInfo.width) && (mouse.offsetY >= shapeInfo.top) && (mouse.offsetY <= shapeInfo.top + shapeInfo.height)) {
        changeMouseType("move");
    } else {
        changeMouseType("default");
    }
}

//改变鼠标指针的类型
function changeMouseType(type) {
    canvasContent.style.cursor = type;
}

//获取当前鼠标的类型
function getMouseType() {
    return canvasContent.style.cursor;
}

//获取当前鼠标的操作行为
function getMouseAction() {
    return getMouseType();
}

//当图形刚绘制完成时描出其边框
function drawBorder(data) {
    //虚线框与图形间的间隔
    var dashOffset = 3;
    ctx.setDashStyle("black", 1, [5]);
    //上虚线框
    ctx.drawDash(data.left, data.top - dashOffset, data.left + data.width, data.top - dashOffset);
    //右虚线框
    ctx.drawDash(data.left + data.width + dashOffset, data.top, data.left + data.width + dashOffset, data.top + data.height);
    //下虚线框
    ctx.drawDash(data.left + data.width, data.top + data.height + dashOffset, data.left, data.top + data.height + dashOffset);
    //左虚线框
    ctx.drawDash(data.left - dashOffset, data.top + data.height, data.left - dashOffset, data.top);
    //绘制边框圆角
    ctx.setLineDash([]);
    //左上角
    ctx.drawArc(data.left - dashOffset, data.top - dashOffset, 3, 0, 2 * Math.PI);
    //右上角
    ctx.drawArc(data.left + data.width + dashOffset, data.top - dashOffset, 3, 0, 2 * Math.PI);
    //右下角
    ctx.drawArc(data.left + data.width + dashOffset, data.top + data.height + dashOffset, 3, 0, 2 * Math.PI);
    //左下角
    ctx.drawArc(data.left - dashOffset, data.top + data.height + dashOffset, 3, 0, 2 * Math.PI);
    ctx.restore();
}

//绘制圆形
CanvasRenderingContext2D.prototype.drawArc = function(x1, y1, radius, startAngle, endAngle) {
    this.beginPath();
    this.arc(x1, y1, radius, startAngle, endAngle);
    this.stroke();
}

//设置虚线的样式
CanvasRenderingContext2D.prototype.setDashStyle = function(color, width, interval) {
    this.strokeStyle = color;
    this.lineWidth = width;
    this.setLineDash(interval);
}

//绘制虚线
CanvasRenderingContext2D.prototype.drawDash = function(x1, y1, x2, y2) {
    this.beginPath();
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
    this.stroke();
}

//当图形绘画完毕时弹出消息框
function popupMessage(shapeCoordinate) {
    //弹出消息框与图形的垂直方向上的间隔
    var POPUP_TOP = 20;
    var popup = document.getElementsByClassName("popup")[0];
    var confirm = document.getElementById("confirm");
    var cancel = document.getElementById("cancel");
    var input = document.getElementById("info-input");
    var output = document.getElementById("info-output");
    popup.style.display = "block";
    var leftDistance = canvasContent.offsetLeft + shapeCoordinate.left + shapeCoordinate.width / 2 - popup.clientWidth / 2;
    var topDistance = canvasContent.offsetTop + shapeCoordinate.top + shapeCoordinate.height + POPUP_TOP;
    popup.style.left = leftDistance;
    popup.style.top = topDistance;

    //点击确定按钮后，打印信息
    confirm.onclick = function() {
        var outputInfo = JSON.stringify(shapeCoordinate) + "\n" + input.value + "\n";
        output.value += outputInfo;
        popup.style.display = "none";
        input.value = "";
    };

    //点击取消时，关闭弹出框并清除已画的图形。
    cancel.onclick = function() {
        popup.style.display = "none";
        ctx.clearRect(shapeCoordinate.left - 1, shapeCoordinate.top - 1, shapeCoordinate.width + 2, shapeCoordinate.height + 2);
    };
}
