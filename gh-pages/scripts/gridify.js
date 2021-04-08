var filters = function filters() {
  var grid = this;

  grid.filter = function () {
    grid.filters.filter();
  };

  var onHeaderCreated = grid.onHeaderCreated;

  grid.onHeaderCreated = function (th, columns) {
    var hasFilters = columns.some(column => column.filter);

    if (hasFilters) {
      grid.filters.initialize(columns);
      grid.filters.addFilters(columns);
    }

    onHeaderCreated(th, columns);
  };

  grid.filters = {
    initialize: function initialize(columns) {
      var filterRow = grid.html.tHead.insertRow();
      filterRow.id = grid.html.id + '-filters';
      columns.forEach(col => {
        filterRow.insertCell(); // .id = xyz, but do we need to name he cell?
      });
    },
    addFilters: function addFilters(columns) {
      var th = grid.html.tHead.rows[1];
      columns.forEach((column, idx) => {
        var filter = grid.filters.addFilter(column);
        th.cells[idx].appendChild(filter);
      });
    },
    addFilter: function addFilter(column) {
      if (!column.filter) {
        return;
      }

      var filter = grid.filters.__getFilterDefinition(column);

      var control = filter.control;
      control.id = grid.html.id + '-filters-' + column.field;
      control.compare = filter.compare;
      return control;
    },
    cells: function cells() {
      return Array.from(grid.html.tHead.rows[1].cells);
    },
    filter: function filter() {
      var controls = grid.filters.getControls();
      var rows = Array.from(grid.html.tBodies[0].rows);
      rows.forEach(row => {
        var cells = Array.from(row.cells);
        var isFiltered = controls.some(control => {
          var cell = cells.find(td => {
            return control.id.split('-').slice(-1)[0] == td.id.split('-').slice(-1)[0];
          });
          return !control.compare(cell.value, control.value);
        });
        row.filtered = isFiltered;
        row.style.display = isFiltered ? 'none' : '';
      });
    },
    getControls: function getControls() {
      return grid.filters.cells().map(cell => cell.firstChild).filter(x => !!x);
    },
    __getFilterDefinition: function __getFilterDefinition(column) {
      var definition = {
        control: grid.filters.__getDefaultFilterControl(column),
        compare: grid.filters.__getDefaultCompare()
      };

      if (typeof column.filter === 'function') {
        definition.compare = column.filter;
      }

      if (typeof column.filter === 'object') {
        for (var key in column.filter) {
          definition[key] = column.filter[key];
        }
      }

      return definition;
    },
    __getDefaultCompare: function __getDefaultCompare() {
      return function (tdValue, filterValue) {
        return ('' + tdValue).toLowerCase().substr(0, filterValue.length) == filterValue.toLowerCase();
      };
    },
    __getDefaultFilterControl: function __getDefaultFilterControl(column) {
      var control = document.createElement('input');
      control.type = 'text';
      control.style = 'display:block; margin: auto; width:80%;';
      control.addEventListener('change', () => {
        grid.filters.filter();
      });
      return control;
    }
  };
};

//Gridify.prototype.extensions.paging = function(){
var paging = function paging() {
  var grid = this;
  var onFooterCreated = grid.onFooterCreated;

  grid.onFooterCreated = function (footer, footers) {
    grid.paging.initialize(grid.html.options.paging);
    onFooterCreated(footer, footers);
  };

  grid.footer.pager = {
    initialize: function initialize(options) {
      var pagingRow = grid.html.tFoot.insertRow();
      pagingRow.id = grid.html.id + '-paging';
      pagingRow.options = options;
      var leftCell = pagingRow.insertCell();
      leftCell.id = grid.html.id + '-paging-left';
      leftCell.style = 'width:33%;';
      var centerCell = pagingRow.insertCell();
      centerCell.id = grid.html.id + '-paging-center';
      centerCell.style = 'width:33%;';
      centerCell.appendChild(grid.footer.pager.centerCell_control(options));
      var rightCell = pagingRow.insertCell();
      rightCell.id = grid.html.id + '-paging-right';
      rightCell.style = 'width:33%;';
    },
    setPage: function setPage(pageNumber) {
      var textbox = document.getElementById(grid.html.id + '-paging-center-textbox');

      if (textbox) {
        textbox.value = pageNumber;
      } // set row counter when up

    },
    centerCell_control: function centerCell_control(options) {
      var container = document.createElement('div');
      container.style = 'width:120px';
      var textbox = document.createElement('input');
      textbox.id = grid.html.id + '-paging-center-textbox';
      textbox.className = 'pager-textbox';
      textbox.value = options.currentPage || 1;
      textbox.addEventListener('change', () => {
        grid.paging.page(textbox.value < options.totalPages ? +textbox.value : options.totalPages);
      });
      var label = document.createElement('span');
      label.style = 'width:40px;vertical-align:top';
      label.innerText = ' of ' + options.totalPages || 1;
      var leftArrow = document.createElement('div');
      leftArrow.className = 'pager-left';

      leftArrow.onclick = () => grid.paging.page(textbox.value > 1 ? +textbox.value - 1 : 1);

      var rightArrow = document.createElement('div');
      rightArrow.className = 'pager-right';

      rightArrow.onclick = () => grid.paging.page(textbox.value < options.totalPages ? +textbox.value + 1 : options.totalPages);

      container.appendChild(leftArrow);
      container.appendChild(textbox);
      container.appendChild(label);
      container.appendChild(rightArrow);
      return container;
    }
  };
  grid.paging = {
    initialize: function initialize(options) {
      if (!options) {
        return;
      }

      grid.paging.extendSorting();
      grid.paging.extendFiltering();
      options = grid.paging._defaultOptions(options);
      grid.html.options.paging = options;
      grid.footer.pager.initialize(options);
      grid.paging.page(options.currentPage);
    } // Not sure how to make these modules agnostic of one another. 
    // In the meantime, paging needs to know about sorting and filtering.
    ,
    extendSorting: function extendSorting() {
      if (typeof grid.sorting !== 'undefined') {
        var sort = grid.sorting.sort;

        grid.sorting.sort = function () {
          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          grid.paging.clear();
          sort(options);
          var currentPage = grid.html.options.paging.currentPage;
          grid.paging.page(currentPage);
        };
      }
    },
    extendFiltering: function extendFiltering() {
      if (typeof grid.filters !== 'undefined') {
        var filter = grid.filters.filter;

        grid.filters.filter = function () {
          grid.paging.clear();
          filter();
          grid.paging.page();
        };
      }
    },
    page: function page() {
      var pageNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      grid.html.options.paging.currentPage = pageNumber;

      grid.paging._setFooterValues(pageNumber);

      grid.paging._setRowVisibility(pageNumber);
    },
    clear: function clear() {
      var rows = Array.from(grid.html.tBodies[0].rows);
      rows.forEach(r => {
        if (r.paged) {
          r.paged = undefined;
          r.style.display = '';
        }
      });
    },
    _setRowVisibility: function _setRowVisibility(pageNumber) {
      var rows = Array.from(grid.html.tBodies[0].rows);
      var options = grid.html.options.paging;
      grid.paging.clear();
      var start = (options.currentPage - 1) * options.rows;
      var end = options.currentPage * options.rows; // Only page visible rows

      rows = rows.filter(r => r.style.display !== 'none');
      rows = rows.filter((r, ix) => ix >= end || ix < start);
      rows.forEach(r => {
        r.style.display = 'none';
        r.paged = true;
      });
    },
    _setFooterValues: function _setFooterValues(pageNumber) {
      grid.footer.pager.setPage(pageNumber);
    },
    _defaultOptions: function _defaultOptions(options) {
      if (typeof options !== 'object') options = {};
      options.rows = options.rows || 20;
      options.totalRows = options.totalRows || grid.data.get().length;
      options.totalPages = Math.ceil(options.totalRows / options.rows);
      options.currentPage = options.currentPage || 1;
      return options;
    }
  };
};

//Gridify.prototype.extensions.sorting = function(){
var sorting = function sorting() {
  var grid = this;
  var onHeaderCellCreated = grid.onHeaderCellCreated;

  grid.onHeaderCellCreated = function (th, headerDefinition) {
    grid.sorting.initialize(th, headerDefinition);
    onHeaderCellCreated(th, headerDefinition);
  };

  grid.sorting = {
    initialize: function initialize(th, headerDefinition) {
      if (!headerDefinition.sort) {
        return;
      }

      var options = grid.sorting._parseOptions(headerDefinition.sort);

      var idx = Array.from(th.parentElement.children).indexOf(th);
      options.idx = idx;
      th.sort = options;

      grid.sorting._addSortIcon(th);

      var sortCallback = grid.sorting._getSortCallback();

      th.addEventListener('click', sortCallback);
    },
    _parseOptions: function _parseOptions(sortOptions) {
      var options = {
        compare: grid.sorting.defaultCompare
      };

      if (typeof sortOptions === 'function') {
        options.compare = sortOptions;
      } else if (typeof sortOptions === 'object') {
        for (var k in sortOptions) {
          options[k] = sortOptions[k];
        }
      }

      return options;
    },
    getSortOptionsByField: function getSortOptionsByField(field) {
      var idx = grid.html.tBodies[0].options.findIndex(colDef => colDef.field == field);
      var th = grid.html.tHead.rows[0].cells[idx];
      return th.sort;
    },
    sort: function sort(options) {
      if (typeof options === 'string') {
        options = grid.sorting.getSortOptionsByField(options);
      }

      options.direction = options.direction === -1 ? 1 : -1;
      var rows = Array.from(grid.html.tBodies[0].rows);
      rows.sort((x, y) => {
        var xv = x.cells[options.idx].value;
        var yv = y.cells[options.idx].value;
        var compared = options.compare(xv, yv);
        return +compared * options.direction;
      });

      grid.sorting._redrawGrid(rows);
    },
    _addSortIcon: function _addSortIcon(th) {
      var icon = th.appendChild(document.createElement('span'));
      icon.className = 'sort';
      th.style.paddingRight = '30px';
    },
    _getSortCallback: function _getSortCallback() {
      return e => {
        grid.sorting.sort(e.target.sort);
      };
    },
    _redrawGrid: function _redrawGrid(rows) {
      grid.body.clear();
      var tBody = grid.html.tBodies[0];
      rows.forEach(r => tBody.appendChild(r));
    }
  };
  Object.defineProperty(grid.sorting, 'defaultCompare', {
    get: () => function (a, b) {
      if (a == b) {
        return 0;
      }

      return a < b ? 1 : -1;
    }
  });
};

//Gridify.prototype.extensions.styling = function() {
var styling = function styling() {
  var grid = this;
  var onTableCreated = grid.onTableCreated;

  grid.onTableCreated = function (table, options) {
    grid.styling.stylize(table, options);
    onTableCreated(table, options);
  };

  var onCaptionCreated = grid.onCaptionCreated;

  grid.onCaptionCreated = function (caption, options) {
    grid.styling.stylize(caption, options);
    onCaptionCreated(caption, options);
  };

  var onHeaderCellCreated = grid.onHeaderCellCreated;

  grid.onHeaderCellCreated = function (th, options) {
    if (options.style) {
      grid.styling.setStyle(th, options.style);
    }

    grid.styling.stylize(th, options.header);
    onHeaderCellCreated(th, options);
  };

  var onTableCellCreated = grid.onTableCellCreated;

  grid.onTableCellCreated = function (td, options) {
    grid.styling.stylize(td, options);
    onTableCellCreated(td, options);
  };

  var onFooterCellCreated = grid.onFooterCellCreated;

  grid.onFooterCellCreated = function (td, options) {
    grid.styling.stylize(td, options.footer);
    onFooterCellCreated(td, options);
  };

  grid.styling = {
    stylize: function stylize(el, options) {
      if (!options) {
        return;
      }

      if (options.className) {
        el.className = options.className;
      }

      if (options.style) {
        grid.styling.setStyle(el, options.style);
      }
    },
    setStyle: function setStyle(el, style) {
      (style || '').split(';').map(x => x.trim().split(':')).forEach(kv => {
        if (!kv || kv.length !== 2) {
          return;
        }

        var key = kv[0].trim(),
            value = kv[1].trim();
        el.style[key] = value;
      });
    }
  };
};

var Gridify = function Gridify() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var grid = this;
  grid.container = options.container;

  if (typeof grid.container === 'string') {
    grid.container = document.getElementById(grid.container);
  }

  grid.create = function (options) {
    if (grid.container) {
      _clear(grid.container);
    }

    grid.table.create(options);
    grid.caption.create(options.caption);
    grid.header.create(options.columns);
    grid.body.create(options.data, options.columns);
    grid.footer.create(options.columns); // Called here so that onTableCreated is passed the completed table.

    grid.onTableCreated(_table, options);

    if (grid.container) {
      grid.container.appendChild(_table);
    }
  };

  grid.onTableCreated = function (table, options) {
    if (options.onTableCreated) {
      options.onTableCreated(table, options);
    }
  };

  grid.onCaptionCreated = function (caption, captionDefinition) {
    if (options.onCaptionCreated) {
      options.onCaptionCreated(caption, captionDefinition);
    }
  };

  grid.onHeaderCreated = function (tHead, headers) {
    if (options.onHeaderCreated) {
      options.onHeaderCreated(tHead, headers);
    }
  };

  grid.onHeaderCellCreated = function (th, headerDefinition) {
    if (options.onHeaderCellCreated) {
      options.onHeaderCellCreated(th, headerDefinition);
    }
  };

  grid.onTableBodyCreated = function (tBody, columns) {
    if (options.onTableBodyCreated) {
      options.onTableBodyCreated(tBody, columns);
    }
  };

  grid.onTableRowCreated = function (tr, columns) {
    if (options.onTableRowCreated) {
      options.onTableRowCreated(tr, columns);
    }
  };

  grid.onTableCellCreated = function (td, columnDefinition) {
    if (options.onTableCellCreated) {
      options.onTableCellCreated(td, columnDefinition);
    }
  };

  grid.onFooterCreated = function (tFoot, footers) {
    if (options.onFooterCreated) {
      options.onFooterCreated(tFoot, footers);
    }
  };

  grid.onFooterCellCreated = function (td, footerDefinition) {
    if (options.onFooterCellCreated) {
      options.onFooterCellCreated(td, footerDefinition);
    }
  };

  var _clear = function _clear(container) {
    while (container && container.firstChild) {
      container.removeChild(container.firstChild);
    }
  };

  var _setAttributes = function _setAttributes(el, attributes) {
    for (var _k in attributes) {
      el.setAttribute(_k, attributes[_k]);
    }
  };

  var _table;

  grid.table = {
    create: function create(options) {
      _table = grid.table.initialize(options);

      _setAttributes(_table, options.attributes);
    },
    initialize: function initialize(options) {
      _table = document.createElement('table');
      _table.id = grid.table._getTableId(options);
      _table.options = options;
      return _table;
    },
    _getTableId: function _getTableId(options) {
      if (_table.id) {
        return _table.id;
      }

      if (options.id) {
        return options.id;
      }

      if (grid.container) {
        return grid.container.id + '-grid';
      }

      return 'new-grid';
    }
  };
  Object.defineProperty(grid, 'html', {
    get: () => _table
  });
  grid.caption = {
    create: function create(captionOptions) {
      if (!captionOptions) {
        return;
      }

      var caption = grid.caption.initialize(captionOptions);

      _setAttributes(caption, caption.options.attributes);

      caption.innerText = caption.options.text;
      grid.onCaptionCreated(caption, caption.options);
    },
    initialize: function initialize(captionOptions) {
      var caption = _table.createCaption();

      caption.id = _table.id + '-caption';
      caption.options = typeof captionOptions === 'string' ? {
        text: captionOptions
      } : captionOptions;
      return caption;
    }
  };
  grid.header = {
    create: function create(columns) {
      if (!columns) {
        return;
      }

      var tHead = grid.header.initialize(columns);
      grid.header.addHeaderCells();
      grid.onHeaderCreated(tHead, tHead.options);
    },
    initialize: function initialize(columns) {
      if (_table.tHead) {
        _table.removeChild(_table.tHead);
      }

      var tHead = _table.createTHead();

      tHead.id = _table.id + '-thead';
      tHead.options = grid.header._parseOptions(columns);
      return tHead;
    },
    _parseOptions: function _parseOptions(columns) {
      return columns.map(opt => {
        if (typeof opt.header === 'string') {
          opt.header = {
            text: opt.header
          };
        }

        return opt;
      });
    },
    addHeaderCells: function addHeaderCells() {
      var hr = _table.tHead.insertRow();

      _table.tHead.options.forEach(o => {
        grid.header.addHeaderCell(hr, o);
      });
    },
    addHeaderCell: function addHeaderCell(headerRow, columnDefinition) {
      var th = document.createElement('th');
      th.id = _table.tHead.id + '-' + columnDefinition.field || headerRow.cells.length;
      headerRow.appendChild(th);

      if (columnDefinition.header) {
        th.innerText = columnDefinition.header.text || '';

        _setAttributes(th, columnDefinition.header.attributes);
      }

      grid.onHeaderCellCreated(th, columnDefinition);
    }
  };
  grid.body = {
    create: function create(data) {
      var columns = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : options.columns;
      var tBody = grid.body.initialize(columns);

      for (var idx in data) {
        grid.body.addTableRow(tBody, idx, data[idx]);
      }

      grid.onTableBodyCreated(tBody, tBody.options);
    },
    initialize: function initialize(columns) {
      while (_table.tBodies.length) {
        _table.removeChild(_table.tBodies[0]);
      }

      var tBody = _table.createTBody();

      tBody.id = _table.id + '-tbody';
      tBody.options = columns;
      return tBody;
    },
    _parseColumns: function _parseColumns(columns) {
      return columns.map(col => {
      });
    },
    clear: function clear() {
      _clear(_table.tBodies[0]);
    },
    getColumnDefinition: function getColumnDefinition(field) {
      var colDefs = _table.tBodies[0].options;

      if (!colDefs) {
        return;
      }

      return colDefs.find(d => d.field == field);
    },
    addTableRow: function addTableRow(tBody, ridx, rowData) {
      var tr = tBody.insertRow();
      tr.id = tBody.id + '-' + ridx;
      var colDefs = tBody.options;

      if (colDefs) {
        for (var d in colDefs) {
          var field = colDefs[d].field;
          grid.body.addTableCell(tr, field, rowData[field]);
        }
      } else {
        for (var _field in rowData) {
          grid.body.addTableCell(tr, _field, rowData[_field]);
        }
      }

      grid.onTableRowCreated(tr);
    },
    addTableCell: function addTableCell(tr, field, value) {
      var td = tr.insertCell();
      td.id = tr.id + '-' + field;
      td.field = field;
      td.value = value;
      td.innerText = value;
      var colDef = grid.body.getColumnDefinition(field);

      if (colDef && colDef.attributes) {
        _setAttributes(td, colDef.attributes);
      }

      if (colDef && colDef.click) {
        td.onclick = colDef.click;
      }

      grid.onTableCellCreated(td, colDef);
    }
  };
  grid.data = {
    get: function get() {
      return Array.from(_table.tBodies[0].rows).map(r => grid.data.getRowData(r));
    },
    set: function set(data) {
      grid.body.create(data);
    },
    getRowData: function getRowData(tr) {
      var rowData = {};
      Array.from(tr.cells).forEach(td => {
        rowData[td.field] = td.value;
      });
      return rowData;
    }
  };
  grid.footer = {
    create: function create(columns) {
      if (!columns) {
        return;
      }

      var tFoot = grid.footer.initialize(columns);
      grid.footer.addFooterCells();
      grid.onFooterCreated(tFoot, tFoot.options);
    },
    initialize: function initialize(columns) {
      if (_table.tFoot) {
        _table.removeChild(_table.tFoot);
      }

      var tFoot = _table.createTFoot();

      tFoot.id = _table.id + '-tfoot';
      tFoot.options = grid.footer._parseOptions(columns);
      return tFoot;
    },
    _parseOptions: function _parseOptions(columns) {
      return columns.map(opt => {
        if (typeof opt.footer === 'string') {
          opt.footer = {
            text: opt.footer
          };
        }

        return opt;
      });
    },
    addFooterCells: function addFooterCells() {
      var fr = _table.tFoot.insertRow();

      _table.tFoot.options.forEach(o => {
        grid.footer.addFooterCell(fr, o);
      });
    },
    addFooterCell: function addFooterCell(footerRow, columnDefinition) {
      var td = footerRow.insertCell();
      td.id = _table.tFoot.id + '-' + columnDefinition.field || footerRow.cells.length;

      if (columnDefinition.footer) {
        td.innerText = columnDefinition.footer.text || '';

        _setAttributes(td, columnDefinition.footer.attributes);
      }

      grid.onFooterCellCreated(td, columnDefinition);
    }
  };

  for (var k in grid.extensions) {
    grid.extensions[k].apply(grid, arguments);
  }

  grid.create(options);
  return grid;
};
Gridify.prototype.extensions = {
  filters: filters,
  sorting: sorting,
  paging: paging,
  styling: styling
};

export { Gridify };
