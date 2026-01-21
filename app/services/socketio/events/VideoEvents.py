from flask_socketio import emit
from flask import request
from app.utils.loggers import get_logger

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
                emit(
                    "subscribed_video",
                    {
                        "status": "success",
                        "data": data,
                    },
                )

                logger.info(
                    f"Client {request.sid} subscribed to video: {data}",
                    exc_info=True,
                )

            except Exception as e:
                logger.error(f"Error in subscribe_video: {str(e)}", exc_info=True)
                emit("error", {"message": str(e)})

        @socketio.on("unsubscribe_video")
        def handle_unsubscribe_video(data):
            """
            Unsubscribe from video stream
            """
            try:
                emit(
                    "unsubscribed_video",
                    {
                        "status": "success",
                        "data": data,
                    },
                )

            except Exception as e:
                logger.error(f"Error in unsubscribe_video: {str(e)}", exc_info=True)

        @socketio.on("video_start_request")
        def handle_video_start_request(data):
            """
            Client requests to start video streaming
            """
            try:
                emit(
                    "video_start_request_acknowledged",
                    {
                        "status": "success",
                        "data": data,
                    },
                )

                logger.info(
                    f"Client {request.sid} started video streaming: {data}",
                    exc_info=True,
                )

            except Exception as e:
                logger.error(f"Error in video_start_request: {str(e)}", exc_info=True)
                emit("error", {"message": str(e)})

        @socketio.on("video_stop_request")
        def handle_video_stop_request(data):
            """
            Client requests to stop video streaming
            """
            try:
                emit(
                    "video_stop_request_acknowledged",
                    {
                        "status": "success",
                        "data": data,
                    },
                )

                logger.info(
                    f"Client {request.sid} stopped video streaming: {data}",
                    exc_info=True,
                )

            except Exception as e:
                logger.error(f"Error in video_stop_request: {str(e)}", exc_info=True)
                emit("error", {"message": str(e)})
