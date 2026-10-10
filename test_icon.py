import win32gui
import win32ui
import win32con
import win32api
from PIL import Image
import base64
import io

def get_icon_base64(exe_path):
    try:
        large, small = win32gui.ExtractIconEx(exe_path, 0)
        if not large and not small:
            return None
            
        useIcon = large[0] if large else small[0]
        
        hdc = win32ui.CreateDCFromHandle(win32gui.GetDC(0))
        hbmp = win32ui.CreateBitmap()
        hbmp.CreateCompatibleBitmap(hdc, 32, 32)
        hdc = hdc.CreateCompatibleDC()
        hdc.SelectObject(hbmp)
        
        # draw icon
        win32gui.DrawIconEx(hdc.GetSafeHdc(), 0, 0, useIcon, 32, 32, 0, None, win32con.DI_NORMAL)
        
        bmpinfo = hbmp.GetInfo()
        bmpstr = hbmp.GetBitmapBits(True)
        img = Image.frombuffer('RGBA', (bmpinfo['bmWidth'], bmpinfo['bmHeight']), bmpstr, 'raw', 'BGRA', 0, 1)
        
        win32gui.DestroyIcon(useIcon)
        if large: win32gui.DestroyIcon(large[0])
        if small: win32gui.DestroyIcon(small[0])
        
        # Convert to base64
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode()
    except Exception as e:
        print(e)
        return None

print(get_icon_base64("C:\\Windows\\System32\\notepad.exe")[:50])
