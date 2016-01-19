/* rangerIn v 1.0.0
   ========================================================================== */

/*
*
*
  Options:
    - legend: display default legend, min value, avg value and max value with '+'
    - bodyClassOnMove: add class to body element on indicator move
*
*
*/

/*globals jQuery, document */
(function ($) {
    "use strict";
    var pluginName  =   "rangerIn",
        defaults    =   {
            legend: false,
            bodyClassOnMove: 'rangeMove',
            callbackFunction: function () {}
        };
    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = element;
        this.rangerin = {};
        this.$element = $(this.element);
        this.options = options;
        this.metadata = this.$element.data('options');
        this.settings = $.extend({}, defaults, this.options, this.metadata);
        this.init();
    }
    Plugin.prototype = {
        init: function () {
          this.constructHtml();
          this.setDefaultObjects();
          this.setDefaultValues();
          this.setDefaultOffsets();
          if (this.settings.legend) {
            this.setLegendValues();
          }
          this.checkWindowSize();
          this.startEvent();
          this.endEvent();
        },
        constructHtml: function () {
          var html = '';
          var hiddenInput = '';
          hiddenInput = '<input type="hidden" value="' + this.$element.val() + '" name="' + this.$element.attr('name') + '" id="' + this.$element.attr('id') + '" class="inputRange"/>';
          html += '<div class="input-range">';
          html += '<div class="input-range__belt">';
          if (this.settings.legend) {
            html += '<span class="input-range__legend"><i class="legend--min"></i><i class="legend--mid"></i><i class="legend--max"></i></span>';
          }
          html += '<span class="input-range__progress"></span>';
          html += '<span class="input-range__indicator" data-label=""></span>';
          html += '</div>';
          html += '</div>';

          this.$element
            .hide()
            .after(hiddenInput)
            .after(html)
            .removeAttr('name')
            .removeAttr('id');
        },
        setDefaultObjects: function () {
          this.rangerin.$inputRangeHidden = $('.inputRange');
          this.rangerin.$inputRangeProgress = $('.input-range__progress');
          this.rangerin.$inputRangeIndicator = $('.input-range__indicator');
          this.rangerin.$inputRangeBelt = $('.input-range__belt');
          this.rangerin.$inputRangeLegend = $('.input-range__legend');
        },
        setDefaultValues: function () {
          this.rangerin.sideOffset = 0;
          this.rangerin.minRange = +this.$element.attr('min');
          this.rangerin.maxRange = +this.$element.attr('max');
          this.rangerin.mainValue = this.$element.val();
          this.rangerin.$inputRangeIndicator.attr('data-label', this.rangerin.mainValue);
        },
        setDefaultOffsets: function () {
          this.rangerin.minOffset = this.rangerin.$inputRangeIndicator.width() / 2;
          this.rangerin.maxOffset = this.rangerin.$inputRangeBelt.width() - this.rangerin.$inputRangeIndicator.width();
          this.recalculateIndicatorPosition();
        },
        setLegendValues: function () {
          this.rangerin.$inputRangeLegend.find('.legend--min').text(this.rangerin.minRange);
          this.rangerin.$inputRangeLegend.find('.legend--mid').text(Math.floor((this.rangerin.maxRange + this.rangerin.minRange) / 2));
          this.rangerin.$inputRangeLegend.find('.legend--max').text(this.rangerin.maxRange + '+');
        },
        checkWindowSize: function () {
          var plugin = this;
          $(window).on('resize.rangerin', function () {
            plugin.setDefaultOffsets();
            plugin.recalculateIndicatorPosition();
          });
        },
        checkPageXofEvent: function (event) {
          var pageX;
          if (event.pageX) {
            pageX = event.pageX;
          } else if (event.originalEvent.touches[0].pageX) {
            pageX = event.originalEvent.touches[0].pageX;
          } else {
            console.error('Touch/mouse event error.');
            pageX = false;
          }
          return pageX;
        },
        startEvent: function () {
          var plugin = this;
          plugin.rangerin.$inputRangeIndicator.on('mousedown.rangerin touchstart.rangerin', function (event) {
            if (plugin.settings.bodyClassOnMove) {
              $('body').addClass(plugin.settings.bodyClassOnMove);
            }
            var pageX,
                indicatorPosition;
            pageX = plugin.checkPageXofEvent(event);
            indicatorPosition = pageX - plugin.rangerin.sideOffset;
            plugin.moveEvent(indicatorPosition);
          });
        },
        moveEvent: function (indicatorPosition) {
          var plugin = this;
          $(document).on('mousemove.rangerin touchmove.rangerin', function (event) {
            var pageX,
                sideOffset = plugin.rangerin.sideOffset;
            pageX = plugin.checkPageXofEvent(event);
            sideOffset = pageX - indicatorPosition;
            sideOffset = plugin.limitOffset(sideOffset);
            plugin.rangerin.sideOffset = sideOffset;
            plugin.moveIndicator(sideOffset);
            plugin.moveProgressbar(sideOffset);
            plugin.setMainValue(sideOffset);
          });
        },
        endEvent: function () {
          var plugin = this;
          $(document).on('mouseup.rangerin touchend.rangerin', function () {
            $('body').removeClass(plugin.settings.bodyClassOnMove);
            $(document).off('mousemove.rangerin touchmove.rangerin mouseup.rangerin touchend.rangerin');
            plugin.endEvent();
          });
        },
        moveIndicator: function (offset) {
          this.rangerin.$inputRangeIndicator.css({left: offset});
        },
        moveProgressbar: function (offset) {
          this.rangerin.$inputRangeProgress.css({width: offset + this.rangerin.minOffset});
        },
        setMainValue: function (offset) {
          this.rangerin.mainValue = Math.round((this.rangerin.maxRange - this.rangerin.minRange) * (offset / this.rangerin.maxOffset) + this.rangerin.minRange);
          this.rangerin.$inputRangeHidden.val(this.rangerin.mainValue);
          this.rangerin.$inputRangeIndicator.attr('data-label', this.rangerin.mainValue);
        },
        limitOffset: function (offset) {
          if (offset < 0) {
              offset = 0;
          }
          if (offset > this.rangerin.maxOffset) {
              offset = this.rangerin.maxOffset;
          }
          return offset;
        },
        recalculateIndicatorPosition: function () {
          var plugin = this,
              newOffset;
          newOffset = Math.round((+plugin.rangerin.mainValue - plugin.rangerin.minRange) / (plugin.rangerin.maxRange - plugin.rangerin.minRange) * plugin.rangerin.maxOffset);
          newOffset = plugin.limitOffset(newOffset);
          plugin.rangerin.sideOffset = newOffset;
          plugin.moveIndicator(newOffset);
          plugin.moveProgressbar(newOffset);
        }
    };
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, pluginName)) {
                $.data(this, pluginName, new Plugin(this, options));
            }
        });
    };
}(jQuery));
