from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class Handler(SimpleHTTPRequestHandler):
    def list_directory(self, path):
        try:
            f = open(os.path.join(path, 'index.html'), 'rb')
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            return f
        except:
            return super().list_directory(path)

httpd = HTTPServer(('', 9000), Handler)
print("Serving at port 9000")
httpd.serve_forever()
