import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import type { WsEvent } from '../types'
import { useAuth } from '../contexts/AuthContext'

export function useWebSocket<T = unknown>(
  topic: string,
  onMessage: (event: WsEvent<T>) => void
): void {
  const { user } = useAuth()
  const handlerRef = useRef(onMessage)
  handlerRef.current = onMessage

  useEffect(() => {
    if (!user) return

    const token  = localStorage.getItem('token')
    const client = new Client({
      brokerURL: `ws://localhost:8081/ws`,
      connectHeaders: { Authorization: `Bearer ${token ?? ''}` },
      onConnect: () => {
        client.subscribe(topic, msg => {
          handlerRef.current(JSON.parse(msg.body) as WsEvent<T>)
        })
      },
      onStompError: frame => console.error('WS error:', frame),
      reconnectDelay: 3000,
    })

    client.activate()
    return () => { if (client.active) client.deactivate() }
  }, [user, topic])
}