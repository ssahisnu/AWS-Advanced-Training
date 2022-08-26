/**
 * base class for a canvas that draws coloured points on a given
 * background colour
 */
class DrawingContainer
{
    constructor(containerName,
                configuration,
                statisticsCallback
              )
    {
        var container = document.getElementById(containerName);

        this.configuration      = configuration;
        this.isDrawing          = false;
        this.canvas             = this.setupCanvas(container);
        this.ctx                = this.canvas.context;
        this.statisticsCallback = statisticsCallback;

        var self                = this;

        this.statistics         = this.clearStatistics();

        // define a custom fillCircle method
        this.ctx.fillCircle = function(x, y, radius, fillColor)
        {
            var cs = getComputedStyle(container);
            var current_width = parseInt(cs.getPropertyValue('width'), 10);
            var current_height = parseInt(cs.getPropertyValue('height'), 10);
            var specified_width = container.width;
            var specified_height = container.height;

            x = x * specified_width/current_width;
            y = y * specified_height/current_height;

            this.fillStyle = fillColor;
            this.beginPath();
            this.moveTo(x, y);
            this.arc(x, y, radius, 0, Math.PI * 2, false);
            this.fill();
        };

        this.ctx.clearTo = function()
        {
            self.ctx.clearRect(0, 0, container.width, container.height);
        };

        this.ctx.clearTo();
    }

    clearStatistics()
    {
        var statistics =
        {
          "MessagesSent"      : 0,
          "MessagesReceived"  : 0,
          "MessagesConfirmed" : 0,
          "MessagesDeleted"   : 0,
          "MessageLatencyAggregate" : 0,
          "MessageLatencyAverage" : 0
        };

        return statistics;
    }

    // -- general drawing methods

    clearCanvas()
    {
        this.ctx.clearTo("#000");
        this.resetMessageCounter();
        this.statistics.MessagesSent++;
        this.BroadcastStatistics();
    }

    setupCanvas(theCanvas)
    {
        var canvas = {};

        canvas.node     = theCanvas;
        canvas.context  = canvas.node.getContext('2d');
        return canvas;
    }

    drawPoint(x ,y)
    {
        this.ctx.fillCircle(x, y, 5, '#f6b500');
    }

    resetMessageCounter()
    {
      this.statistics = this.clearStatistics();
      this.BroadcastStatistics();
    }

    BroadcastStatistics()
    {
      if ( this.statisticsCallback )
        this.statisticsCallback(this.statistics);
    }

    /**
     * recursive function to deal with finding the offset of nested elements
     */
    offset(elem)
    {
        var x = elem.offsetLeft;
        var y = elem.offsetTop;

        while (elem = elem.offsetParent)
        {
            x += elem.offsetLeft;
            y += elem.offsetTop;
        }

        return { left: x, top: y };
    }
}

/**
 * common base class for a couple of publishing classes - just a
 * bucket for shared state semantics at the moment
 */
class EventPublisherDrawingContainer extends DrawingContainer
{
    constructor(container,
                configuration,
                statisticsCallback
              )
    {
        super(container, configuration, statisticsCallback);
    }
};

/**
 * minimal common base class for consumers of messages
 */
class EventSubscriberDrawingContainer extends DrawingContainer
{
    constructor(container,
                configuration,
                statisticsCallback
              )
    {
        super(container, configuration, statisticsCallback);
    }

    processMessage(message)
    {
        // Determine latency
        var dateNow  = new Date().getTime();
        var tickDiff = dateNow - message.timestamp;

        if(message.clear)
        {
            this.clearCanvas();
            this.statistics.MessageLatencyAggregate = tickDiff;
            this.statistics.MessageLatencyAverage   = tickDiff;
        }
        else
        {
            this.drawPoint(message.x, message.y);

            this.statistics.MessageLatencyAggregate += tickDiff;
            this.statistics.MessageLatencyAverage = this.statistics.MessageLatencyAggregate / this.statistics.MessagesReceived;
        }

        this.statistics.MessagesReceived++;
        this.BroadcastStatistics();
    }
};
