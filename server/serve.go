/*
Serve is a very simple static file server in go
Usage:

	-p="8100": port to serve on
	-d=".":    the directory of static files to host

Navigating to http://localhost:8100 will display the index.html or directory
listing file.
*/
package main

import (
	"flag"
	"log"
	"net/http"
)

// noCacheHandler wraps a handler and adds headers to prevent caching
func noCacheHandler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")
		h.ServeHTTP(w, r)
	})
}

func main() {
	port := flag.String("p", "8100", "port to serve on")
	directory := flag.String("d", ".", "the directory of static file to host")
	flag.Parse()

	fileServer := http.FileServer(http.Dir(*directory))
	http.Handle("/", noCacheHandler(fileServer))

	log.Printf("Serving %s on HTTP port: %s (no-cache mode)\n", *directory, *port)
	log.Fatal(http.ListenAndServe(":"+*port, nil))
}
