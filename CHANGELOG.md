YAMVC - change log
=============

##0.1.5
* Proxies introduced (Localstorage)

##0.1.6
* Rewritten class system
* Collection covered
* Examples fixed

##0.1.7
* Promises arrived

##0.1.8
* Rewritten rendering method in `ya.experimental.View`
* In `ya.experimental.View` templates are now automatically bind to data
* Asynchronous model methods now use promises

##0.1.9
* `ya.experimental.View` merged to main View class
* Example #1 updated to v0.1.9
* `ya.Collection` now has `add`, `load` and `save` methods
* `ya.data.proxy.Ydn` moved to experimental

##0.1.10
* Proxy operations are now stored in Action object
* Model and Collection rewritten to use action
* All static methods are now $ prefixed

##0.1.11
* view might be now initialized with `ya.view.Template` object
* in template tags now use css attribute instead of style for styling
* in `ya.View` models are now stored in array
* new example, old ones updated to v0.1.11
* classList polifill by Eli Grey

##0.1.12
* addListener and removeListener are now addEventListener and removeEventListener
* `ya.View` can be now rerender
* `Core` and object that inherited from it contains now static factory method '$create' which should be used instead of
new keyword
* `filter` method in `ya.Collection` can takes now two arguments where first is id of passed filter and second is
filtering function
* `ya.Collection` has now method `clearFilter`

##0.1.13
* namespace was changed from `yamvc` to `ya` (suggested by Łukasz Sudoł)
