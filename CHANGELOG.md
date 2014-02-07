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
* Rewritten rendering method in `yamvc.experimental.View`
* In `yamvc.experimental.View` data is now automatically bind to template
* Asynchronous model methods now use promises

##0.1.9
* `yamvc.experimental.View` merged to main View class
* Example #1 updated to v0.1.9
* `yamvc.Collection` now has `add`, `load` and `save` methods
* `yamvc.data.proxy.Ydn` moved to experimental

##0.1.10
* Proxy operations are now stored in Action object
* Model and Collection rewritten to use action
* All static methods are now $ prefixed

##0.1.11
* view might be now initialized with `yamvc.view.Template` object
* in template instead of `style` attribute you should use `css`
* in `yamvc.View` models are now stored in array
* new example, old ones updated to v0.1.11
* classList polifill by Eli Grey

##0.1.12
* addListener and removeListener are now addEventListener and removeEventListener
* `yamvc.View` can be now rerender
* `Core` and object that inherited from it contains now static factory method '$create' which should be used instead of
new keyword
* `filter` method in `yamvc.Collection` can takes now two arguments where first is id of passed filter and second is
filtering function
* `yamvc.Collection` has now method `clearFilter`
