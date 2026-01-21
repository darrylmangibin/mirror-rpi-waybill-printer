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

        @socketio.on("start_recording")
        def handle_video_start_request(data):
            """
            Start recording
            """
            try:
                emit(
                    "start_recording",
                    {
                        "status": "success",
                        "data": data,
                    },
                )

                logger.info(
                    f"Client {request.sid} started recording: {data}",
                    exc_info=True,
                )

            except Exception as e:
                logger.error(f"Error in start_recording: {str(e)}", exc_info=True)
                emit("error", {"message": str(e)})

        @socketio.on("stop_recording")
        def handle_video_stop_request(data):
            """
            Stop recording
            """
            try:
                emit(
                    "stop_recording",
                    {
                        "status": "success",
                        "data": data,
                    },
                )

                logger.info(
                    f"Client {request.sid} stopped recording: {data}",
                    exc_info=True,
                )

            except Exception as e:
                logger.error(f"Error in stop_recording: {str(e)}", exc_info=True)
                emit("error", {"message": str(e)})

        @socketio.on("open_camera")
        def handle_open_camera(data):
            """
            Open camera
            """
            try:
                emit(
                    "open_camera",
                    {
                        "status": "success",
                        "data": data,
                    },
                )
            except Exception as e:
                logger.error(f"Error in open_camera: {str(e)}", exc_info=True)
                emit("error", {"message": str(e)})

        @socketio.on("take_photo")
        def handle_take_photo(data):
            """
            Take photo
            """
            try:
                emit(
                    "take_photo",
                    {
                        "status": "success",
                        "data": data,
                    },
                )
            except Exception as e:
                logger.error(f"Error in take_photo: {str(e)}", exc_info=True)
                emit("error", {"message": str(e)})

        @socketio.on("close_camera")
        def handle_close_camera(data):
            """
            Close camera
            """
            try:
                emit(
                    "close_camera",
                    {
                        "status": "success",
                        "data": data,
                    },
                )
            except Exception as e:
                logger.error(f"Error in close_camera: {str(e)}", exc_info=True)
                emit("error", {"message": str(e)})
