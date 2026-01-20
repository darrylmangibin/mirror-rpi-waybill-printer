from flask_socketio import emit, join_room, leave_room
from flask import request
from app.utils.loggers import get_logger
from app.services.socketio.services.SocketIOService import SocketIOService

logger = get_logger(__name__)


class VideoEvents:
    """
    Handle video streaming events (video_start, video_stop)
    """

    @staticmethod
    def register_events(socketio):
        """Register all video-related events"""

        @socketio.on("subscribe_video")
        def handle_subscribe_video(data):
            """
            Subscribe to video stream updates
            Client sends: { "stream_id": "camera-1" }
            """
            try:
                stream_id = data.get("stream_id", "default")

                room_name = SocketIOService.get_video_room_name(stream_id)
                join_room(room_name)

                logger.info(
                    f"📹 Client {request.sid} subscribed to video stream: {stream_id}"
                )

                emit(
                    "video_subscribed",
                    {
                        "status": "success",
                        "stream_id": stream_id,
                        "message": f"Subscribed to video stream {stream_id}",
                    },
                )

            except Exception as e:
                logger.error(f"Error in subscribe_video: {str(e)}", exc_info=True)
                emit("error", {"message": str(e)})

        @socketio.on("unsubscribe_video")
        def handle_unsubscribe_video(data):
            """
            Unsubscribe from video stream
            Client sends: { "stream_id": "camera-1" }
            """
            try:
                stream_id = data.get("stream_id", "default")

                room_name = SocketIOService.get_video_room_name(stream_id)
                leave_room(room_name)

                logger.info(
                    f"📹 Client {request.sid} unsubscribed from video stream: {stream_id}"
                )

                emit(
                    "video_unsubscribed", {"status": "success", "stream_id": stream_id}
                )

            except Exception as e:
                logger.error(f"Error in unsubscribe_video: {str(e)}", exc_info=True)

        @socketio.on("video_start_request")
        def handle_video_start_request(data):
            """
            Client requests to start video streaming
            Client sends: { "stream_id": "camera-1", "quality": "high" }
            """
            try:
                stream_id = data.get("stream_id", "default")
                quality = data.get("quality", "medium")

                logger.info(
                    f"📹 Video start requested - Stream: {stream_id}, Quality: {quality}"
                )

                # Emit to the requester
                emit(
                    "video_start_acknowledged",
                    {
                        "status": "success",
                        "stream_id": stream_id,
                        "quality": quality,
                        "message": "Video start request acknowledged",
                    },
                )

            except Exception as e:
                logger.error(f"Error in video_start_request: {str(e)}", exc_info=True)
                emit("error", {"message": str(e)})

        @socketio.on("video_stop_request")
        def handle_video_stop_request(data):
            """
            Client requests to stop video streaming
            Client sends: { "stream_id": "camera-1" }
            """
            try:
                stream_id = data.get("stream_id", "default")

                logger.info(f"📹 Video stop requested - Stream: {stream_id}")

                # Emit to the requester
                emit(
                    "video_stop_acknowledged",
                    {
                        "status": "success",
                        "stream_id": stream_id,
                        "message": "Video stop request acknowledged",
                    },
                )

            except Exception as e:
                logger.error(f"Error in video_stop_request: {str(e)}", exc_info=True)
                emit("error", {"message": str(e)})
