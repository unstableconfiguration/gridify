# Gridify 
HTML Table generation utility inspired by jqGrid. Focus is on being lightweight and minimalist, and on offering transparency and access to the generated html.

## Example usage 
See more examples on the demo page. The design principles lean toward exposing and allowing modifications of the .html elements. For example, rather than providing lots of formatting options, we expose 'style' and 'class'/'className' options that will be directly reflected in the generated table. 
```
    let gridContainer = document.getElementById('gridContainer');
    let grid = new Gridify(gridContainer);

    grid.initialize({
        // A list of column definition objects
        columns : [
            { field : 'FullName' , header : 'Name' },
            { field : 'Active', style : 'background : grey; font-weight:bold' }
        ],
        // A list of data objects
        data : [
            { FullName : 'Person A', Active : true },
            { FullName : 'Person B', Active : false }
        ],
        style : 'border: solid thin black;', 
        className : 'localTableStyle'
    });
```

# Gridify Sorting 
Sorting can be added to a column as part of its definition. 
```
    let sortContainer = document.getElementById('sortContainer');
    let sortGrid = new Gridify(sortContainer);

    sortGrid.initialize({
        columns : [
            // sort : true uses default .js sorting 
            { field : 'Field 1', sort : true },
            // We can provide a custom sort function with our own sort rules
            { field : 'Field 2', sort : (a, b) => +a >= +b ? 1 : -1 }
        ],
        data : [/* ... */]
    });
```

# Gridify Filtering 
Filtering can be added to a column as part of its definition. 
```
    let filterContainer = document.getElementById('filterContainer');
    let filterGrid = new Gridify(filterContainer);
    
    filterGrid.initialize({
        columns : [
            // filter : true gives us a textbox with basic text filter
            { field : 'Field 1', filter : true },
            // filter : function gives us a textbox that filters using a custom callback
            { field : 'Field 2', filter : (cell, filter) => cell.includes(filter) }
        ],
        data : [/* ... */]
    })
```

# Gridify Paging
For large data sets, pagination can be added to the table definition 
```
    let pagingContainer = document.getElementById('pagingContainer');
    let pagingGrid = new Gridify(pagingContainer);

    pagingGrid.initialize({
        columns : [/* ... */],
        data : [/* ... */],
        // paging: true gives us a default 20 rows per page
        // paging : true
        // we can set the rows using pagination options
        paging : { rows : 10 }
    });
```


#### Work to do: 
* Fix up the code style and formatting 
* Make sure our design concepts and philosophies are consistent throughout. 
    * Specifically the true -> function -> options progression for things like adding fitering and sorting 
* Make sure we can do more variations on displays 
* Nested tables 
* Editable fields