import asyncio
import websockets
import json

async def test():
    try:
        async with websockets.connect('ws://127.0.0.1:8765') as ws:
            await ws.send(json.dumps({'type':'auth','password':'remote123'}))
            response = await ws.recv()
            print("Response:", response)
    except Exception as e:
        print("Error:", e)

asyncio.run(test())
