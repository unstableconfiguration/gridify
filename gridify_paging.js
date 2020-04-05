Gridify.prototype.extensions.paging = function(div){
    let grid = this;

    let onGridInitialized = grid.onInitialized;
    grid.onInitialized = function(options){
        onGridInitialized(options);
        grid.paging.initialize(options.paging);
    }

    grid.footer.pager = {
        initialize : function(options){
            let pagingRow = grid.table.tFoot.insertRow();
            pagingRow.id = grid.table.id + '_paging';
            pagingRow.options = JSON.stringify(options); 

            let leftCell = pagingRow.insertCell();
            leftCell.id = grid.table.id + '_paging_left';
            leftCell.style = 'width:33%;';

            let centerCell = pagingRow.insertCell();
            centerCell.id = grid.table.id + '_paging_center';
            centerCell.style = 'width:33%;';
            centerCell.appendChild(grid.footer.pager.centerCell_control(options));

            let rightCell = pagingRow.insertCell();
            rightCell.id = grid.table.id + '_paging_right';
            rightCell.style = 'width:33%;'    
        }
        , setPage : function(pageNumber){
            let textbox = document.getElementById(grid.table.id + '_paging_center_textbox');
            if(textbox) textbox.value = pageNumber;
            // set row counter when up
        }
        , centerCell_control : function(options){
            let container = document.createElement('div');
            container.style = 'width:120px'

            let textbox = document.createElement('input');
            textbox.id = grid.table.id + '_paging_center_textbox';
            textbox.className = 'pager_textbox';
            textbox.value = options.currentPage || 1;

            let label = document.createElement('span');
            label.style = 'width:40px;vertical-align:top';
            label.innerText = ' of ' + options.totalPages || 1;

            let leftArrow = document.createElement('div');
            leftArrow.className = 'pager_left';
            leftArrow.onclick = () => 
                grid.paging.page(textbox.value > 1 ? +textbox.value -1 : 1);
            
            let rightArrow = document.createElement('div');
            rightArrow.className = 'pager_right';
            rightArrow.onclick = () => 
                grid.paging.page(textbox.value < options.totalPages ? +textbox.value+1 : options.totalPages); 

            container.appendChild(leftArrow);
            container.appendChild(textbox);
            container.appendChild(label);
            container.appendChild(rightArrow);

            return container;
        }
    }

    grid.paging = { 
        initialize : function(options){
            if(!options) return;
            grid.paging.extendSorting();
            grid.paging.extendFiltering();
            options = grid.paging._defaultOptions(options);
            grid.table.options.paging = options;
            grid.footer.pager.initialize(options); 
            grid.paging.page(options.currentPage);
        }
        // Not sure how to make these modules agnostic of one another. 
        // In the meantime, paging needs to know about sorting and filtering.
        , extendSorting : function(){
            if(typeof(grid.sorting) !== 'undefined'){
                let sort = grid.sorting.sort;
                grid.sorting.sort = function(field, options = {}){
                    grid.paging.clear();
                    sort(field, options);
                    let currentPage = grid.table.options.paging.currentPage;    
                    grid.paging.page(currentPage);
                }
            }
        }
        , extendFiltering : function(){
            if(typeof(grid.filtering) !== 'undefined'){
                let filter = grid.filtering.filter;
                grid.filtering.filter = function(){
                    grid.paging.clear();
                    filter(); 
                    grid.paging.page();
                }
            }
        }
        , page : function(pageNumber = 1){
            grid.options.paging.currentPage = pageNumber;
            grid.paging._setFooterValues(pageNumber);
            grid.paging._setRowVisibility(pageNumber);
        }
        , clear : function() { 
            let rows = grid.body.rows;
            rows.forEach(r => { if(r.paged) { r.paged = undefined; r.style.display = ''; } });
        }
        , _setRowVisibility : function(pageNumber){
            let rows = grid.body.rows;
            let options = grid.options.paging;
            
            grid.paging.clear();

            let start = (options.currentPage-1)*options.rows;
            let end = options.currentPage*options.rows;

            // Only page visible rows
            rows = rows.filter(r => r.style.display !== 'none');
            rows = rows.filter((r, ix) => ix >= end || ix < start);

            rows.forEach(r => {r.style.display = 'none'; r.paged = true; });
        }
        , _setFooterValues : function(pageNumber){
            grid.footer.pager.setPage(pageNumber);
        }
        , _defaultOptions : function(options){
            if(typeof(options) !== 'object') options = {};
            options.rows = options.rows || 20;
            options.totalRows = options.totalRows || grid.data.get().length;
            options.totalPages = Math.ceil(options.totalRows/options.rows);
            options.currentPage = options.currentPage || 1;
            return options;
        }
    }
}