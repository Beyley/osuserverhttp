var _____WB$wombat$assign$function_____ = function (name) {
  return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name];
};
if (!self.__WB_pmw) {
  self.__WB_pmw = function (obj) {
    this.__WB_source = obj;
    return this;
  }
} {
  let window = _____WB$wombat$assign$function_____("window");
  let self = _____WB$wombat$assign$function_____("self");
  let document = _____WB$wombat$assign$function_____("document");
  let location = _____WB$wombat$assign$function_____("location");
  let top = _____WB$wombat$assign$function_____("top");
  let parent = _____WB$wombat$assign$function_____("parent");
  let frames = _____WB$wombat$assign$function_____("frames");
  let opener = _____WB$wombat$assign$function_____("opener");

  $(document).ready(function () {
    $("#pagecontent img").hover(function () {
      if ($(this).width() >= 660)
        $(this).addClass("expandable");
    }, function () {
      $(this).removeClass("expandable");
    });
    $("#pagecontent img").click(function () {
      $(this).toggleClass("expanded");
    });
    $(".form-text").formDefaults();
    $('#quickreply-text').keydown(function (e) {
      if (e.ctrlKey && e.keyCode == 13) {
        $("#quickreplybutton").click();
        return false;
      }
    });
    handleFrozenHeader();
    handleClickableCells();
  });

  function handleFrozenHeader() {
    var fixable = $("#fixable");
    if (!fixable.length) return;
    var clone = null;
    $(window).resize(function () {
      if (clone !== null) clone.css("left", (fixable.offset().left - $(window).scrollLeft()) + 'px');
    });
    $(window).scroll(function () {
      if (clone !== null) clone.css("left", (fixable.offset().left - $(window).scrollLeft()) + 'px');
      if ($(window).scrollTop() >= fixable.offset().top) {
        if (clone === null) {
          clone = fixable.clone();
          clone.addClass(fixable.is(".minimal") ? "frozen-header minimal" : "frozen-header").css("width", fixable.width() + 'px').css("left", fixable.offset().left + 'px');
          $('body').append(clone);
        }
      } else {
        if (clone !== null) {
          clone.remove();
          clone = null;
        }
      }
    });
  }

  function handleClickableCells() {
    var clickableCells = $(".clickable-cell");
    if (!clickableCells.length) return;
    clickableCells.click(function () {
      if ($(this).find(".hovering").length) return true;
      loadUrl($(this).find("a:first").attr('href'));
      return false;
    });
    clickableCells.find("a").hover(function () {
      $(this).toggleClass('hovering', true);
    }, function () {
      $(this).toggleClass('hovering', false);
    });
  }

  function translate(langCode) {
    location.href = 'https://web.archive.org/web/20120517155233/http://www.google.com/translate?u=' + encodeURIComponent(location.href) + '&langpair=en%7C' + langCode + '&hl=en&ie=UTF8';
    return false;
  }

  function loadUrl(url) {
    if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
      var referLink = document.createElement('a');
      referLink.href = url;
      document.body.appendChild(referLink);
      referLink.click();
    } else {
      location.href = url;
    }
    return false;
  }

  function urlencode(str) {
    return escape(str).replace('+', '%2B').replace('%20', '+').replace('*', '%2A').replace('/', '%2F').replace('@', '%40');
  }

  function check(url, message) {
    if (confirm("You are about to " + message + ".\nAre you sure you want to do this?"))
      loadUrl(url);
  }

  function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  }
  var prevTimeout = null;

  function expandRow(setId, instant) {
    if ($("#info" + setId).is(':hidden')) {
      if (prevTimeout !== null)
        clearTimeout(prevTimeout);
      prevTimeout = setTimeout(function () {
        $(".expandableInfo").slideUp(200);
        $("#info" + setId).slideDown(200);
      }, instant ? 0 : 400);
    }
  }

  function shrinkRows() {
    if (prevTimeout !== null)
      clearTimeout(prevTimeout);
  }

  function helpClicked(id, n) {
    $("#helpContent").slideUp(300);
    $("#helpLoading").fadeIn(500);
    $(".helpSquare").removeClass("helpSquareLarge");
    $(".helpSquare").addClass("helpSquareSmall");
    $("#helpContent").load("/pages/include/faq-section.php?id=" + id + "&n=" + n, {
      limit: 25
    }, function () {
      $("#helpContent").slideDown(500);
      $("#helpLoading").hide(0);
    });
  }

  function helpJumpSection(id, c, n) {
    $("#helpContent").slideUp(300);
    $("#helpLoading").fadeIn(500);
    $(".helpSquare").removeClass("helpSquareLarge");
    $(".helpSquare").addClass("helpSquareSmall");
    $("#helpContent").load("pages/include/faq-section.php?id=" + id + "&n=" + n, {
      limit: 25
    }, function () {
      $("#helpContent").slideDown(500);
      $("#helpLoading").hide(0);
      window.location = c;
    });
  }

  function addFavourite(area, id) {
    area.html("Processing...");
    area.load("/web/favourite.php?a=" + id);
    return false;
  }

  function updateChat() {
    $("#chat").load("/pages/include/home-ircfeed.php", {
      limit: 25
    }, function () {
      setTimeout(updateChat, 10000);
    });
  }

  function updateRecent() {
    $("#recent_plays").load("/pages/include/home-recentplays.php", {
      limit: 25
    });
    setTimeout('updateRecent()', 30000);
  }

  function updateMostPlayed() {
    $("#most_played").load("/pages/include/home-mostplayed.php", {
      limit: 25
    }, function () {
      setTimeout(updateMostPlayed, 600000);
    });
  }

  function expandPack(id) {
    if (id === null || id === undefined) return;
    if (!($("#" + id).hasClass("expanded"))) {
      if (!$("#" + id).hasClass("loaded")) {
        $("#" + id).html("<center>Loading...</center>");
        $.get("/pages/include/packlist-info.php?n=" + id, null, function (text) {
          $("#" + id).html(text);
          $("#" + id).addClass("loaded");
        });
      }
      $("#" + id).slideDown(500);
      $("#" + id).addClass("expanded");
    } else {
      $("#" + id).slideUp("fast");
      $("#" + id).removeClass("expanded");
    }
  }
  var mcp_page = 1;
  var mcp_forum = 'c';

  function mcpSetPage(page) {
    mcp_page = page;
    return mcpProcess();
  }

  function mcpNextPage() {
    mcp_page++;
    return mcpProcess();
  }

  function mcpPrevPage() {
    if (mcp_page > 1) mcp_page--;
    return mcpProcess();
  }

  function mcpSetForum(f) {
    if (mcp_forum != f && (f == 'c' || f == 'h')) {
      mcp_forum = f;
      mcp_page = 1;
    }
    return mcpProcess();
  }

  function mcpProcess() {
    var options = ($("#unmarked").attr("checked") ? 1 : 0) +
      ($("#starred").attr("checked") ? 2 : 0) +
      ($("#bubbled").attr("checked") ? 4 : 0) +
      ($("#zero").attr("checked") ? 8 : 0) +
      ($("#replied").attr("checked") ? 16 : 0) +
      ($("#difficulty").attr("checked") ? 32 : 0) +
      ($("#nuked").attr("checked") ? 64 : 0);
    $("#mcp-list").prepend("<center><h2>Loading...</h2></center>");
    $.get("/pages/include/modcp-list.php?p=" + mcp_page + "&f=" + mcp_forum + "&o=" + options + "&n=" + ($("#nmaps").attr("value")), null, function (text) {
      $("#mcp-list").html(text);
    });
    return false;
  }
  jQuery(function () {
    jQuery('ul.sf-menu').superfish();
  });
  (function ($) {
    $.fn.superfish = function (op) {
      var sf = $.fn.superfish,
        c = sf.c,
        $arrow = $(['<span class="', c.arrowClass, '"> &#187;</span>'].join('')),
        over = function () {
          var $$ = $(this),
            menu = getMenu($$);
          clearTimeout(menu.sfTimer);
          $$.showSuperfishUl().siblings().hideSuperfishUl();
        },
        out = function () {
          var $$ = $(this),
            menu = getMenu($$),
            o = sf.op;
          clearTimeout(menu.sfTimer);
          menu.sfTimer = setTimeout(function () {
            o.retainPath = ($.inArray($$[0], o.$path) > -1);
            $$.hideSuperfishUl();
            if (o.$path.length && $$.parents(['li.', o.hoverClass].join('')).length < 1) {
              over.call(o.$path);
            }
          }, o.delay);
        },
        getMenu = function ($menu) {
          var menu = $menu.parents(['ul.', c.menuClass, ':first'].join(''))[0];
          sf.op = sf.o[menu.serial];
          return menu;
        },
        addArrow = function ($a) {
          $a.addClass(c.anchorClass).append($arrow.clone());
        };
      return this.each(function () {
        var s = this.serial = sf.o.length;
        var o = $.extend({}, sf.defaults, op);
        o.$path = $('li.' + o.pathClass, this).slice(0, o.pathLevels).each(function () {
          $(this).addClass([o.hoverClass, c.bcClass].join(' ')).filter('li:has(ul)').removeClass(o.pathClass);
        });
        sf.o[s] = sf.op = o;
        $('li:has(ul)', this)[($.fn.hoverIntent && !o.disableHI) ? 'hoverIntent' : 'hover'](over, out).each(function () {
          if (o.autoArrows) addArrow($('>a:first-child', this));
        }).not('.' + c.bcClass).hideSuperfishUl();
        var $a = $('a', this);
        $a.each(function (i) {
          var $li = $a.eq(i).parents('li');
          $a.eq(i).focus(function () {
            over.call($li);
          }).blur(function () {
            out.call($li);
          });
        });
        o.onInit.call(this);
      }).addClass([c.menuClass, c.shadowClass].join(' '));
    };
    var sf = $.fn.superfish;
    sf.o = [];
    sf.op = {};
    sf.IE7fix = function () {
      var o = sf.op;
      if ($.browser.msie && $.browser.version > 6 && o.dropShadows && o.animation.opacity !== undefined)
        this.toggleClass(sf.c.shadowClass + '-off');
    };
    sf.c = {
      bcClass: 'sf-breadcrumb',
      menuClass: 'sf-js-enabled',
      anchorClass: 'sf-with-ul',
      arrowClass: 'sf-sub-indicator',
      shadowClass: 'sf-shadow'
    };
    sf.defaults = {
      hoverClass: 'sfHover',
      pathClass: 'overideThisToUse',
      pathLevels: 1,
      delay: 400,
      animation: {
        opacity: 'show'
      },
      speed: 80,
      autoArrows: true,
      dropShadows: true,
      disableHI: false,
      onInit: function () { },
      onBeforeShow: function () { },
      onShow: function () { },
      onHide: function () { }
    };
    $.fn.extend({
      hideSuperfishUl: function () {
        var o = sf.op,
          not = (o.retainPath === true) ? o.$path : '';
        o.retainPath = false;
        var $ul = $(['li.', o.hoverClass].join(''), this).add(this).not(not).removeClass(o.hoverClass).find('>ul').hide().css('visibility', 'hidden');
        o.onHide.call($ul);
        return this;
      },
      showSuperfishUl: function () {
        var o = sf.op,
          sh = sf.c.shadowClass + '-off',
          $ul = this.addClass(o.hoverClass).find('>ul:hidden').css('visibility', 'visible');
        sf.IE7fix.call($ul);
        o.onBeforeShow.call($ul);
        $ul.animate(o.animation, o.speed, function () {
          sf.IE7fix.call($ul);
          o.onShow.call($ul);
        });
        return this;
      }
    });
  })(jQuery);
  (function ($) {
    $.fn.formDefaults = function (options) {
      var opts = $.extend({}, $.fn.formDefaults.defaults, options);
      return this.each(function () {
        var $this = $(this);
        var $form = $this.parents("form");
        $this.data("defaultValue", this.value).addClass("form-default-value-processed");
        if (opts.inactiveColor) {
          $this.css("color", opts.inactiveColor);
        }
        $this.focus(function () {
          if (this.value == $this.data("defaultValue")) {
            this.value = '';
            this.style.color = opts.activeColor;
          }
        }).blur(function () {
          if (this.value === '') {
            this.style.color = opts.inactiveColor;
            this.value = $this.data("defaultValue");
          }
        });
        if (!$form.data("defaultValueProcessed")) {
          $form.data("defaultValueProcessed", true).submit(function (e) {
            $(this).find(".form-default-value-processed").each(function () {
              var $el = $(this);
              if ($el.data("defaultValue") == $el.val()) {
                $el.val('');
              }
            });
          });
        }
      });
    };
    $.fn.formDefaults.defaults = {
      activeColor: '#000',
      inactiveColor: '#b9bab5'
    };
  }(jQuery));

  function popup(url, width, height) {
    window.open(url.replace(/&amp;/g, '&'), '_popup', 'HEIGHT=' + height + ',resizable=yes,scrollbars=yes, WIDTH=' + width);
    return false;
  }

  function marklist(id, name, state) {
    var parent = document.getElementById(id);
    if (!parent) {
      eval('parent = document.' + id);
    }
    if (!parent) {
      return;
    }
    var rb = parent.getElementsByTagName('input');
    for (var r = 0; r < rb.length; r++) {
      if (rb[r].name.substr(0, name.length) == name) {
        rb[r].checked = state;
      }
    }
  }

  function toggleSpoiler(root) {
    $(root).parents(".spoiler").children(".spoiler_body").slideToggle("fast");
    return false;
  }

  function expandPost() {
    $("#truncated").hide(0);
    $("#full").show(0);
    return false;
  }

  function userSearch() {
    document.location = "/u/" + $("#user-search").val();
    return false;
  }

  function beatmapSearch() {
    document.location = "/p/beatmaplist?q=" + $("#beatmap-search").val();
    return false;
  }

  function setDocumentLocation(newLocation) {
    document.location = newLocation;
  }
}