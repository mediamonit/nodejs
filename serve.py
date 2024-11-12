from http.server import HTTPServer, SimpleHTTPRequestHandler

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

httpd = HTTPServer(('localhost', 9000), CORSRequestHandler)
print("Serving: http://localhost:9000")
httpd.serve_forever()
