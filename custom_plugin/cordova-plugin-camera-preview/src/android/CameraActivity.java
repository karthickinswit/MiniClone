package com.cordovaplugincamerapreview;
import android.database.Cursor;
import android.net.Uri;
import android.os.Environment;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.app.Fragment;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.media.AudioManager;
import android.provider.MediaStore;
import android.util.Base64;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.ImageFormat;
import android.graphics.Matrix;
import android.graphics.Rect;
import android.graphics.YuvImage;
import android.hardware.Camera;
import android.hardware.Camera.PictureCallback;
import android.hardware.Camera.ShutterCallback;
import android.media.CamcorderProfile;
import android.media.MediaRecorder;
import android.os.Bundle;
import android.util.Log;
import android.util.DisplayMetrics;
import android.util.Size;
import android.view.GestureDetector;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.ScaleGestureDetector;
import android.view.Surface;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.SeekBar;

import androidx.exifinterface.media.ExifInterface;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.LOG;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.lang.Exception;
import java.lang.Integer;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Arrays;
import java.util.UUID;

import com.appiyo.matrix_mini_marketclone.R;

import java.text.SimpleDateFormat;
import java.util.Date;

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Rect;

import java.util.Calendar;
import java.nio.ByteBuffer;



public class CameraActivity extends Fragment {

  public interface CameraPreviewListener {
    void onPictureTaken(String originalPicture);
    void onPictureTakenError(String message);
    void onSnapshotTaken(String originalPicture);
    void onSnapshotTakenError(String message);
    void onFocusSet(int pointX, int pointY);
    void onFocusSetError(String message);
    void onBackButton();
    void onCameraStarted();
    void onStartRecordVideo();
    void onStartRecordVideoError(String message);
    void onStopRecordVideo(String file);
    void onStopRecordVideoError(String error);
  }

  private CameraPreviewListener eventListener;
  private static final String TAG = "CameraActivity";
  public FrameLayout mainLayout;
  public FrameLayout frameContainerLayout;

  private Preview mPreview;
  private boolean canTakePicture = true;

  private View view;
  private Camera.Parameters cameraParameters;
  private Camera mCamera;
  private int numberOfCameras;
  private int cameraCurrentlyLocked;
  private int currentQuality;

  // The first rear facing camera
  private int defaultCameraId;
  public String defaultCamera;

  public boolean tapToTakePicture;
  public boolean dragEnabled;
  public boolean tapToFocus;
  public boolean disableExifHeaderStripping;
  public boolean storeToFile;
  public boolean toBack;

  public int width;
  public int height;
  public int x;
  public int y;
  private int rotationDegrees = 0;


  private static int zoom = 1;

  public String superImposeText;


  private enum RecordingState {INITIALIZING, STARTED, STOPPED}

  private RecordingState mRecordingState = RecordingState.INITIALIZING;
  private MediaRecorder mRecorder = null;
  private String recordFilePath;

  public void setEventListener(CameraPreviewListener listener){
    eventListener = listener;
  }

  private String appResourcesPackage;

  SeekBar seekBar;

  FrameLayout progressBarHolder;

  private SimpleOrientationListener mOrientationListener;

  @Override
  public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
    appResourcesPackage = getActivity().getPackageName();

    setOrientationListener();

    // Inflate the layout for this fragment
    view = inflater.inflate(getResources().getIdentifier("camera_activity", "layout", appResourcesPackage), container, false);
    progressBarHolder = (FrameLayout) view.findViewById(R.id.camera_loader);

    createCameraPreview();
    seekBar  = (SeekBar) view.findViewById(R.id.seekBar);

    seekBar.setProgress(zoom);

    seekBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
      @Override
      public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
        setZoom(progress);
        System.out.println("Zoom-progress"+ progress);
      }

      @Override
      public void onStartTrackingTouch(SeekBar seekBar) { }

      @Override
      public void onStopTrackingTouch(SeekBar seekBar) { }
    });

    return view;
  }

  public void setRect(int x, int y, int width, int height){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  private void createCameraPreview(){
    if(mPreview == null) {
      setDefaultCameraId();

      //set box position and size
      FrameLayout.LayoutParams layoutParams = new FrameLayout.LayoutParams(width, height);
      layoutParams.setMargins(x, y, 0, 0);
      frameContainerLayout = (FrameLayout) view.findViewById(getResources().getIdentifier("frame_container", "id", appResourcesPackage));
      frameContainerLayout.setLayoutParams(layoutParams);

      //video view
      mPreview = new Preview(getActivity());
      mainLayout = (FrameLayout) view.findViewById(getResources().getIdentifier("video_view", "id", appResourcesPackage));
      mainLayout.setLayoutParams(new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.MATCH_PARENT, RelativeLayout.LayoutParams.MATCH_PARENT));
      mainLayout.addView(mPreview);
      mainLayout.setEnabled(false);

        if(toBack == false) {
            this.setupTouchAndBackButton();
        }
        this.setupTouchAndBackButton();

        this.setupTouchZoom();

    }
  }

  private void setupTouchZoom() {

    ScaleGestureDetector gestureDetector =
      new ScaleGestureDetector(getActivity().getApplicationContext(),
        new MyPinchListener(){
          @Override
          public boolean onScale(ScaleGestureDetector detector) {

            float scaleFactor = detector.getScaleFactor();

            if (scaleFactor > 1) {
              System.out.println("Zooming Out"+zoom);
              zoom = zoom+1;
              setZoom(zoom);
              seekBar.setProgress(zoom);
            } else {
              System.out.println("Zooming In"+ zoom);
              if(zoom > 0){
                zoom = zoom-1;
                setZoom(zoom);
                seekBar.setProgress(zoom);
              }
            }
            return true;
          }

        });




    frameContainerLayout.setOnTouchListener(new View.OnTouchListener() {
      @Override
      public boolean onTouch(View view, MotionEvent motionEvent) {
        Log.d(TAG, "onTouch: ");

        int mLastTouchX = 0;
        int mLastTouchY = 0;
        int mPosX = 0;
        int mPosY = 0;

        FrameLayout.LayoutParams layoutParams = (FrameLayout.LayoutParams) frameContainerLayout.getLayoutParams();

        gestureDetector.onTouchEvent(motionEvent);

        return true;
      }
    });
  }

  private boolean setZoom(int zoom) {
    Camera camera = this.getCamera();
    int maxZoom = camera.getParameters().getMaxZoom();

    Camera.Parameters params = camera.getParameters();

    if (camera.getParameters().isZoomSupported() && zoom < maxZoom ) {
      params.setZoom(zoom);
      this.setCameraParameters(params);
     // callbackContext.success(zoom);
    }
    return true;
  }

  private int getMaximumZoom() {
    int maxZoom = 100;
    Camera camera = this.getCamera();
    Camera.Parameters params = camera.getParameters();

    if (camera.getParameters().isZoomSupported()) {
      maxZoom = camera.getParameters().getMaxZoom();
      return maxZoom;
    }
    return maxZoom;
  }



  private void setupTouchAndBackButton(){
    final GestureDetector gestureDetector = new GestureDetector(getActivity().getApplicationContext(), new TapGestureDetector());

    getActivity().runOnUiThread(new Runnable() {
      @Override
      public void run() {
        frameContainerLayout.setClickable(true);
        frameContainerLayout.setOnTouchListener(new View.OnTouchListener() {

          private int mLastTouchX;
          private int mLastTouchY;
          private int mPosX = 0;
          private int mPosY = 0;

          @Override
          public boolean onTouch(View v, MotionEvent event) {
            FrameLayout.LayoutParams layoutParams = (FrameLayout.LayoutParams) frameContainerLayout.getLayoutParams();


            boolean isSingleTapTouch = gestureDetector.onTouchEvent(event);
            if (event.getAction() != MotionEvent.ACTION_MOVE && isSingleTapTouch) {
              if (tapToTakePicture && tapToFocus) {
                setFocusArea((int) event.getX(0), (int) event.getY(0), new Camera.AutoFocusCallback() {
                  public void onAutoFocus(boolean success, Camera camera) {
                    if (success) {
                      takePicture(0, 0, 50);
                    } else {
                      Log.d(TAG, "onTouch:" + " setFocusArea() did not suceed");
                    }
                  }
                });

              } else if (tapToTakePicture) {
                takePicture(0, 0, 50);

              } else if (tapToFocus) {
                setFocusArea((int) event.getX(0), (int) event.getY(0), new Camera.AutoFocusCallback() {
                  public void onAutoFocus(boolean success, Camera camera) {
                    if (success) {
                      // A callback to JS might make sense here.
                    } else {
                      Log.d(TAG, "onTouch:" + " setFocusArea() did not suceed");
                    }
                  }
                });
              }
              return true;
            } else {
              if (dragEnabled) {
                int x;
                int y;

                switch (event.getAction()) {
                  case MotionEvent.ACTION_DOWN:
                    if (mLastTouchX == 0 || mLastTouchY == 0) {
                      mLastTouchX = (int) event.getRawX() - layoutParams.leftMargin;
                      mLastTouchY = (int) event.getRawY() - layoutParams.topMargin;
                    } else {
                      mLastTouchX = (int) event.getRawX();
                      mLastTouchY = (int) event.getRawY();
                    }
                    break;
                  case MotionEvent.ACTION_MOVE:

                    x = (int) event.getRawX();
                    y = (int) event.getRawY();

                    final float dx = x - mLastTouchX;
                    final float dy = y - mLastTouchY;

                    mPosX += dx;
                    mPosY += dy;

                    layoutParams.leftMargin = mPosX;
                    layoutParams.topMargin = mPosY;

                    frameContainerLayout.setLayoutParams(layoutParams);

                    // Remember this touch position for the next move event
                    mLastTouchX = x;
                    mLastTouchY = y;

                    break;
                  default:
                    break;
                }
              }
            }
            return true;
          }
        });

        frameContainerLayout.setFocusableInTouchMode(true);
        frameContainerLayout.requestFocus();
        frameContainerLayout.setOnKeyListener(new android.view.View.OnKeyListener() {
          @Override
          public boolean onKey(android.view.View v, int keyCode, android.view.KeyEvent event) {
            if (keyCode == android.view.KeyEvent.KEYCODE_BACK) {
              eventListener.onBackButton();
              return true;
            }
            return false;
          }
        });
      }
    });
  }

  private void setDefaultCameraId(){
    // Find the total number of cameras available
    numberOfCameras = Camera.getNumberOfCameras();

    int facing = "front".equals(defaultCamera) ? Camera.CameraInfo.CAMERA_FACING_FRONT : Camera.CameraInfo.CAMERA_FACING_BACK;

    // Find the ID of the default camera
    Camera.CameraInfo cameraInfo = new Camera.CameraInfo();
    for (int i = 0; i < numberOfCameras; i++) {
      Camera.getCameraInfo(i, cameraInfo);
      if (cameraInfo.facing == facing) {
        defaultCameraId = i;
        break;
      }
    }
  }

  @Override
  public void onResume() {
    super.onResume();

    mCamera = Camera.open(defaultCameraId);

    if (cameraParameters != null) {
      mCamera.setParameters(cameraParameters);
    }

    cameraCurrentlyLocked = defaultCameraId;

    if(mPreview.mPreviewSize == null){
      mPreview.setCamera(mCamera, cameraCurrentlyLocked);
      eventListener.onCameraStarted();
    } else {
      mPreview.switchCamera(mCamera, cameraCurrentlyLocked);
      mCamera.startPreview();
    }

    Log.d(TAG, "cameraCurrentlyLocked:" + cameraCurrentlyLocked);

    final FrameLayout frameContainerLayout = (FrameLayout) view.findViewById(getResources().getIdentifier("frame_container", "id", appResourcesPackage));

    ViewTreeObserver viewTreeObserver = frameContainerLayout.getViewTreeObserver();

    if (viewTreeObserver.isAlive()) {
      viewTreeObserver.addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
        @Override
        public void onGlobalLayout() {
          frameContainerLayout.getViewTreeObserver().removeGlobalOnLayoutListener(this);
          frameContainerLayout.measure(View.MeasureSpec.UNSPECIFIED, View.MeasureSpec.UNSPECIFIED);
          Activity activity = getActivity();
          if (isAdded() && activity != null) {
            final RelativeLayout frameCamContainerLayout = (RelativeLayout) view.findViewById(getResources().getIdentifier("frame_camera_cont", "id", appResourcesPackage));

            FrameLayout.LayoutParams camViewLayout = new FrameLayout.LayoutParams(frameContainerLayout.getWidth(), frameContainerLayout.getHeight());
            camViewLayout.gravity = Gravity.CENTER_HORIZONTAL | Gravity.CENTER_VERTICAL;
            frameCamContainerLayout.setLayoutParams(camViewLayout);
          }
        }
      });
    }
    if(this.mOrientationListener == null) {
      setOrientationListener();
    }
  }

  @Override
  public void onPause() {
    super.onPause();
    if(this.mOrientationListener != null) {
      this.mOrientationListener.disable();
      this.mOrientationListener = null;
    }    // Because the Camera object is a shared resource, it's very important to release it when the activity is paused.
    if (mCamera != null) {
      setDefaultCameraId();
      mPreview.setCamera(null, -1);
      mCamera.setPreviewCallback(null);
      mCamera.release();
      mCamera = null;
    }

    Activity activity = getActivity();
    muteStream(false, activity);
  }

  public Camera getCamera() {
    return mCamera;
  }

  public void switchCamera() {
    // Find the total number of cameras available
    numberOfCameras = Camera.getNumberOfCameras();

    // check for availability of multiple cameras
    if (numberOfCameras == 1) {
      //There is only one camera available
    }else{
      Log.d(TAG, "numberOfCameras: " + numberOfCameras);

      // OK, we have multiple cameras. Release this camera -> cameraCurrentlyLocked
      if (mCamera != null) {
        mCamera.stopPreview();
        mPreview.setCamera(null, -1);
        mCamera.release();
        mCamera = null;
      }

      Log.d(TAG, "cameraCurrentlyLocked := " + Integer.toString(cameraCurrentlyLocked));
      try {
        cameraCurrentlyLocked = (cameraCurrentlyLocked + 1) % numberOfCameras;
        Log.d(TAG, "cameraCurrentlyLocked new: " + cameraCurrentlyLocked);
      } catch (Exception exception) {
        Log.d(TAG, exception.getMessage());
      }

      // Acquire the next camera and request Preview to reconfigure parameters.
      mCamera = Camera.open(cameraCurrentlyLocked);

      if (cameraParameters != null) {
        Log.d(TAG, "camera parameter not null");

        // Check for flashMode as well to prevent error on frontward facing camera.
        List<String> supportedFlashModesNewCamera = mCamera.getParameters().getSupportedFlashModes();
        String currentFlashModePreviousCamera = cameraParameters.getFlashMode();
        if (supportedFlashModesNewCamera != null && supportedFlashModesNewCamera.contains(currentFlashModePreviousCamera)) {
          Log.d(TAG, "current flash mode supported on new camera. setting params");
         /* mCamera.setParameters(cameraParameters);
            The line above is disabled because parameters that can actually be changed are different from one device to another. Makes less sense trying to reconfigure them when changing camera device while those settings gan be changed using plugin methods.
         */
        } else {
          Log.d(TAG, "current flash mode NOT supported on new camera");
        }

      } else {
        Log.d(TAG, "camera parameter NULL");
      }

      mPreview.switchCamera(mCamera, cameraCurrentlyLocked);

      mCamera.startPreview();
    }
  }

  public void setCameraParameters(Camera.Parameters params) {
    cameraParameters = params;

    if (mCamera != null && cameraParameters != null) {
      mCamera.setParameters(cameraParameters);
    }
  }

  public boolean hasFrontCamera(){
    return getActivity().getApplicationContext().getPackageManager().hasSystemFeature(PackageManager.FEATURE_CAMERA_FRONT);
  }

  public static Bitmap applyMatrix(Bitmap source, Matrix matrix) {
    return Bitmap.createBitmap(source, 0, 0, source.getWidth(), source.getHeight(), matrix, true);
  }

  ShutterCallback shutterCallback = new ShutterCallback(){
    public void onShutter(){
      // do nothing, availabilty of this callback causes default system shutter sound to work
    }
  };

  private static int exifToDegrees(int exifOrientation) {
    if (exifOrientation == ExifInterface.ORIENTATION_ROTATE_90) { return 90; }
    else if (exifOrientation == ExifInterface.ORIENTATION_ROTATE_180) {  return 180; }
    else if (exifOrientation == ExifInterface.ORIENTATION_ROTATE_270) {  return 270; }
    return 0;
  }

  private String getTempDirectoryPath() {
    File cache = null;

    // Use internal storage
    //cache = getActivity().getCacheDir();

    cache = new File(Environment.getExternalStorageDirectory().getAbsolutePath() +
        File.separator + "Android" + File.separator + "data" + File.separator + getActivity().getPackageName() + File.separator +".files" + File.separator);


    // Create the cache directory if it doesn't exist
    cache.mkdirs();
    return cache.getAbsolutePath();
  }

  private String getTempFilePath() {
    return getTempDirectoryPath() + "/cpcp_capture_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8) + ".jpg";
  }

  PictureCallback jpegPictureCallback = new PictureCallback(){
    public void onPictureTaken(byte[] data, Camera arg1){
      Log.d(TAG, "CameraPreview jpegPictureCallback");

      try {
        if (!disableExifHeaderStripping) {
          Matrix matrix = new Matrix();
          if (cameraCurrentlyLocked == Camera.CameraInfo.CAMERA_FACING_FRONT) {
            matrix.preScale(1.0f, -1.0f);
            if (rotationDegrees == 0)
              rotationDegrees = 180;
            else if (rotationDegrees == 90)
              rotationDegrees = -90;
            else if (rotationDegrees == 180)
              rotationDegrees = 0;
            else if (rotationDegrees == 270)
              rotationDegrees = 90;
            matrix.postRotate(rotationDegrees);
            //Toast.makeText(getActivity().getApplicationContext(), rotationDegrees+"", Toast.LENGTH_LONG).show();
          }else {
            matrix.postRotate(rotationDegrees);
          }
//          int mOrientationHint = calculateOrientationHint();
//          ExifInterface exifInterface = new ExifInterface(new ByteArrayInputStream(data));
//          int rotation = exifInterface.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL);
//          int rotationInDegrees = exifToDegrees(mOrientationHint);
//
//          if (mOrientationHint != 0f) {
//            matrix.setRotate(-mOrientationHint);
//          }

//          if (cameraCurrentlyLocked == Camera.CameraInfo.CAMERA_FACING_FRONT) {
//            if (rotationDegrees == 0)
//              rotationDegrees = 180;
//            else if (rotationDegrees == 180)
//              rotationDegrees = 0;
//          }
          // if (rotationDegrees == 0)
          //     rotationDegrees = -90;
          // else if (rotationDegrees == 90)
          //     rotationDegrees = 0;
          // else if (rotationDegrees == 180)
          //   rotationDegrees = 90;
          // else if (rotationDegrees == 270)
          //   rotationDegrees = 180;
          //   System.out.println("rotation******"+ rotationDegrees);



          // Check if matrix has changed. In that case, apply matrix and override data
          if (!matrix.isIdentity()) {
            Bitmap bitmap = BitmapFactory.decodeByteArray(data, 0, data.length);
            bitmap = applyMatrix(bitmap, matrix);


            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.JPEG, currentQuality, outputStream);
            data = outputStream.toByteArray();
          }
        }

       // String superImposeText = "Test SuperImpose";
      try {
            String lat = "";
            String lng = "";


            SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yy HH:mm:ss");
            String text = sdf.format(Calendar.getInstance().getTime()); // reading local time in the system

            if (!superImposeText.isEmpty()) {
              String[] arrOfSuperImposeTxt = superImposeText.split("Z", 3);
              text = text + " - " + arrOfSuperImposeTxt[0];
              if(arrOfSuperImposeTxt.length > 1){
                lat = arrOfSuperImposeTxt[1];
                lng = arrOfSuperImposeTxt[2];
              }
            }


            Bitmap bmp = BitmapFactory.decodeByteArray(data, 0, data.length).copy(Bitmap.Config.ARGB_8888, true); //myArray is the byteArray containing the image. Use copy() to create a mutable bitmap. Feel free to change the config-type. Consider doing this in two steps so you can recycle() the immutable bitmap.

            // bmp = rotateBitmap(bmp, mPreview.getDisplayOrientation(), cameraCurrentlyLocked == Camera.CameraInfo.CAMERA_FACING_FRONT);
            //bmp = getResizedBitmap(bmp, 500);


            Canvas cs = new Canvas(bmp);
            Paint tPaint = new Paint();

            // float size = setTextSizeForWidth(tPaint, 450, text);
            //System.out.println(size);
            //tPaint.setTextSize(20);

            tPaint.setTextSize(14 * getResources().getDisplayMetrics().density);
            tPaint.setColor(Color.WHITE);
            tPaint.setStyle(Paint.Style.FILL);
            float height = tPaint.measureText("yY");
            cs.drawText(text, 20f, bmp.getHeight() - (height+5f), tPaint);

            if(!lat.isEmpty()) {
              cs.drawText(lat, 20f, 40f, tPaint);

              cs.drawText(lng, 20f, 80f, tPaint);
            }




        if (!storeToFile) {
              String encodedImage = Base64.encodeToString(data, Base64.NO_WRAP);

              eventListener.onPictureTaken(encodedImage);
            } else {
              String path = getTempFilePath();

              FileOutputStream out = new FileOutputStream(path);

              bmp.compress(Bitmap.CompressFormat.PNG, currentQuality, out);
              out.close();

              String compressImagePath = compressImage(path, rotationDegrees);

              progressBarHolder.setVisibility(View.INVISIBLE);

  //          out.write(data);
  //          out.close();
              eventListener.onPictureTaken(compressImagePath);
            }


            Log.d(TAG, "CameraPreview pictureTakenHandler called back");
        } catch (IOException e) {
            progressBarHolder.setVisibility(View.INVISIBLE);
          eventListener.onPictureTakenError("Picture too large (memory)");
        }
      } catch (OutOfMemoryError e) {
        // most likely failed to allocate memory for rotateBitmap
        Log.d(TAG, "CameraPreview OutOfMemoryError");
        // failed to allocate memory
        progressBarHolder.setVisibility(View.INVISIBLE);
        eventListener.onPictureTakenError("Picture too large (memory)");
      } catch (Exception e) {
        progressBarHolder.setVisibility(View.INVISIBLE);
        Log.d(TAG, "CameraPreview onPictureTaken general exception");
      } finally {
        canTakePicture = true;
        try{
          mCamera.startPreview();
          progressBarHolder.setVisibility(View.INVISIBLE);
        }catch(Exception e){
          progressBarHolder.setVisibility(View.INVISIBLE);
        }
      }
    }
  };

   private static float setTextSizeForWidth(Paint paint, float desiredWidth,
                                          String text) {

    // Pick a reasonably large value for the test. Larger values produce
    // more accurate results, but may cause problems with hardware
    // acceleration. But there are workarounds for that, too; refer to
    // http://stackoverflow.com/questions/6253528/font-size-too-large-to-fit-in-cache
    final float testTextSize = 55f;

    // Get the bounds of the text, using our testTextSize.
    paint.setTextSize(testTextSize);
    Rect bounds = new Rect();
    paint.getTextBounds(text, 0, text.length(), bounds);

    // Calculate the desired size as a proportion of our testTextSize.
    float desiredTextSize = testTextSize * desiredWidth / bounds.width();

    // Set the paint for that size.
    return desiredTextSize;
  }


  public static Bitmap rotateBitmap(Bitmap source, float angle, boolean mirror) {
    Matrix matrix = new Matrix();
    if (mirror) {
      matrix.preScale(-1.0f, 1.0f);
    }
    matrix.postRotate(angle);
    return Bitmap.createBitmap(source, 0, 0, source.getWidth(), source.getHeight(), matrix, true);
  }

  private Camera.Size getOptimalPictureSize(final int width, final int height, final Camera.Size previewSize, final List<Camera.Size> supportedSizes){
    /*
      get the supportedPictureSize that:
      - matches exactly width and height
      - has the closest aspect ratio to the preview aspect ratio
      - has picture.width and picture.height closest to width and height
      - has the highest supported picture width and height up to 2 Megapixel if width == 0 || height == 0
    */
    Camera.Size size = mCamera.new Size(width, height);

    // convert to landscape if necessary
    if (size.width < size.height) {
      int temp = size.width;
      size.width = size.height;
      size.height = temp;
    }

    Camera.Size requestedSize = mCamera.new Size(size.width, size.height);

    double previewAspectRatio  = (double)previewSize.width / (double)previewSize.height;

    if (previewAspectRatio < 1.0) {
      // reset ratio to landscape
      previewAspectRatio = 1.0 / previewAspectRatio;
    }

    Log.d(TAG, "CameraPreview previewAspectRatio " + previewAspectRatio);

    double aspectTolerance = 0.1;
    double bestDifference = Double.MAX_VALUE;

    for (int i = 0; i < supportedSizes.size(); i++) {
      Camera.Size supportedSize = supportedSizes.get(i);

      // Perfect match
      if (supportedSize.equals(requestedSize)) {
        Log.d(TAG, "CameraPreview optimalPictureSize " + supportedSize.width + 'x' + supportedSize.height);
        return supportedSize;
      }

      double difference = Math.abs(previewAspectRatio - ((double)supportedSize.width / (double)supportedSize.height));

      if (difference < bestDifference - aspectTolerance) {
        // better aspectRatio found
        if ((width != 0 && height != 0) || (supportedSize.width * supportedSize.height < 2048 * 1024)) {
          size.width = supportedSize.width;
          size.height = supportedSize.height;
          bestDifference = difference;
        }
      } else if (difference < bestDifference + aspectTolerance) {
        // same aspectRatio found (within tolerance)
        if (width == 0 || height == 0) {
          // set highest supported resolution below 2 Megapixel
          if ((size.width < supportedSize.width) && (supportedSize.width * supportedSize.height < 2048 * 1024)) {
            size.width = supportedSize.width;
            size.height = supportedSize.height;
          }
        } else {
          // check if this pictureSize closer to requested width and height
          if (Math.abs(width * height - supportedSize.width * supportedSize.height) < Math.abs(width * height - size.width * size.height)) {
            size.width = supportedSize.width;
            size.height = supportedSize.height;
          }
        }
      }
    }
    Log.d(TAG, "CameraPreview optimalPictureSize " + size.width + 'x' + size.height);
    return size;
  }

  static byte[] rotateNV21(final byte[] yuv, final int width, final int height, final int rotation){
    if (rotation == 0) return yuv;
    if (rotation % 90 != 0 || rotation < 0 || rotation > 270) {
      throw new IllegalArgumentException("0 <= rotation < 360, rotation % 90 == 0");
    }

    final byte[]  output    = new byte[yuv.length];
    final int     frameSize = width * height;
    final boolean swap      = rotation % 180 != 0;
    final boolean xflip     = rotation % 270 != 0;
    final boolean yflip     = rotation >= 180;

    for (int j = 0; j < height; j++) {
      for (int i = 0; i < width; i++) {
        final int yIn = j * width + i;
        final int uIn = frameSize + (j >> 1) * width + (i & ~1);
        final int vIn = uIn       + 1;

        final int wOut     = swap  ? height              : width;
        final int hOut     = swap  ? width               : height;
        final int iSwapped = swap  ? j                   : i;
        final int jSwapped = swap  ? i                   : j;
        final int iOut     = xflip ? wOut - iSwapped - 1 : iSwapped;
        final int jOut     = yflip ? hOut - jSwapped - 1 : jSwapped;

        final int yOut = jOut * wOut + iOut;
        final int uOut = frameSize + (jOut >> 1) * wOut + (iOut & ~1);
        final int vOut = uOut + 1;

        output[yOut] = (byte)(0xff & yuv[yIn]);
        output[uOut] = (byte)(0xff & yuv[uIn]);
        output[vOut] = (byte)(0xff & yuv[vIn]);
      }
    }
    return output;
  }

  public void takeSnapshot(final int quality) {
    mCamera.setPreviewCallback(new Camera.PreviewCallback() {
      @Override
      public void onPreviewFrame(byte[] bytes, Camera camera) {
        try {
          Camera.Parameters parameters = camera.getParameters();
          Camera.Size size = parameters.getPreviewSize();
          int orientation = mPreview.getDisplayOrientation();
          if (mPreview.getCameraFacing() == Camera.CameraInfo.CAMERA_FACING_FRONT) {
            bytes = rotateNV21(bytes, size.width, size.height, (360 - orientation) % 360);
          } else {
            bytes = rotateNV21(bytes, size.width, size.height, orientation);
          }
          // switch width/height when rotating 90/270 deg
          Rect rect = orientation == 90 || orientation == 270 ?
            new Rect(0, 0, size.height, size.width) :
            new Rect(0, 0, size.width, size.height);
          YuvImage yuvImage = new YuvImage(bytes, parameters.getPreviewFormat(), rect.width(), rect.height(), null);
          ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
          yuvImage.compressToJpeg(rect, quality, byteArrayOutputStream);
          byte[] data = byteArrayOutputStream.toByteArray();
          byteArrayOutputStream.close();
          eventListener.onSnapshotTaken(Base64.encodeToString(data, Base64.NO_WRAP));
        } catch (IOException e) {
          Log.d(TAG, "CameraPreview IOException");
          eventListener.onSnapshotTakenError("IO Error");
        } finally {

          mCamera.setPreviewCallback(null);
        }
      }
    });
  }

  public void takePicture(final int width, final int height, final int quality){
    Log.d(TAG, "CameraPreview takePicture width: " + width + ", height: " + height + ", quality: " + quality);

    if(mPreview != null) {
      if(!canTakePicture){
        return;
      }

      canTakePicture = false;

      getActivity().runOnUiThread(new Runnable() {
        @Override
        public void run() {
          progressBarHolder.setVisibility(View.VISIBLE);
        }
      });

      new Thread() {
        public void run() {
          try {
            Camera.Parameters params = mCamera.getParameters();

            Camera.Size size = getOptimalPictureSize(width, height, params.getPreviewSize(), params.getSupportedPictureSizes());
            params.setPictureSize(size.width, size.height);
            currentQuality = quality;

            if(cameraCurrentlyLocked == Camera.CameraInfo.CAMERA_FACING_FRONT && !storeToFile) {
              // The image will be recompressed in the callback
              params.setJpegQuality(99);
            } else {
              params.setJpegQuality(quality);
            }

            //params.setRotation(mPreview.getDisplayOrientation());

            mCamera.setParameters(params);
            mCamera.takePicture(shutterCallback, null, jpegPictureCallback);
          }catch (Exception e) {
          }
        }
      }.start();
    } else {
      canTakePicture = true;
    }
  }

  public void startRecord(final String filePath, final String camera, final int width, final int height, final int quality, final boolean withFlash){
    Log.d(TAG, "CameraPreview startRecord camera: " + camera + " width: " + width + ", height: " + height + ", quality: " + quality);
    Activity activity = getActivity();
    muteStream(true, activity);
    if (this.mRecordingState == RecordingState.STARTED) {
      Log.d(TAG, "Already Recording");
      return;
    }

    this.recordFilePath = filePath;
    int mOrientationHint = calculateOrientationHint();
    int videoWidth = 0;//set whatever
    int videoHeight = 0;//set whatever

    Camera.Parameters cameraParams = mCamera.getParameters();
    if (withFlash) {
      cameraParams.setFlashMode(withFlash ? Camera.Parameters.FLASH_MODE_TORCH : Camera.Parameters.FLASH_MODE_OFF);
      mCamera.setParameters(cameraParams);
      mCamera.startPreview();
    }

    mCamera.unlock();
    mRecorder = new MediaRecorder();

    try {
      mRecorder.setCamera(mCamera);

      CamcorderProfile profile;
      if (CamcorderProfile.hasProfile(defaultCameraId, CamcorderProfile.QUALITY_HIGH)) {
        profile = CamcorderProfile.get(defaultCameraId, CamcorderProfile.QUALITY_HIGH);
      } else {
        if (CamcorderProfile.hasProfile(defaultCameraId, CamcorderProfile.QUALITY_480P)) {
          profile = CamcorderProfile.get(defaultCameraId, CamcorderProfile.QUALITY_480P);
        } else {
          if (CamcorderProfile.hasProfile(defaultCameraId, CamcorderProfile.QUALITY_720P)) {
            profile = CamcorderProfile.get(defaultCameraId, CamcorderProfile.QUALITY_720P);
          } else {
            if (CamcorderProfile.hasProfile(defaultCameraId, CamcorderProfile.QUALITY_1080P)) {
              profile = CamcorderProfile.get(defaultCameraId, CamcorderProfile.QUALITY_1080P);
            } else {
              profile = CamcorderProfile.get(defaultCameraId, CamcorderProfile.QUALITY_LOW);
            }
          }
        }
      }


      mRecorder.setAudioSource(MediaRecorder.AudioSource.VOICE_RECOGNITION);
      mRecorder.setVideoSource(MediaRecorder.VideoSource.CAMERA);
      mRecorder.setProfile(profile);
      mRecorder.setOutputFile(filePath);
      mRecorder.setOrientationHint(mOrientationHint);

      mRecorder.prepare();
      Log.d(TAG, "Starting recording");
      mRecorder.start();
      eventListener.onStartRecordVideo();
    } catch (IOException e) {
      eventListener.onStartRecordVideoError(e.getMessage());
    }
  }

  public int calculateOrientationHint() {
    DisplayMetrics dm = new DisplayMetrics();
    Camera.CameraInfo info = new Camera.CameraInfo();
    Camera.getCameraInfo(defaultCameraId, info);
    int cameraRotationOffset = info.orientation;
    Activity activity = getActivity();

    activity.getWindowManager().getDefaultDisplay().getMetrics(dm);
    int currentScreenRotation = activity.getWindowManager().getDefaultDisplay().getRotation();

    int degrees = 0;
    switch (currentScreenRotation) {
      case Surface.ROTATION_0:
        degrees = 0;
        break;
      case Surface.ROTATION_90:
        degrees = 90;
        break;
      case Surface.ROTATION_180:
        degrees = 180;
        break;
      case Surface.ROTATION_270:
        degrees = 270;
        break;
    }

    int orientation;
    if (info.facing == Camera.CameraInfo.CAMERA_FACING_FRONT) {
      orientation = (cameraRotationOffset + degrees) % 360;
      if (degrees != 0) {
        orientation = (360 - orientation) % 360;
      }
    } else {
      orientation = (cameraRotationOffset - degrees + 360) % 360;
    }
    Log.w(TAG, "************orientationHint ***********= " + orientation);

    return orientation;
  }

  public void stopRecord() {
    Log.d(TAG, "stopRecord");
    try {
      mRecorder.stop();
      mRecorder.reset();   // clear recorder configuration
      mRecorder.release(); // release the recorder object
      mRecorder = null;
      mCamera.lock();
      Camera.Parameters cameraParams = mCamera.getParameters();
      cameraParams.setFlashMode(Camera.Parameters.FLASH_MODE_OFF);
      mCamera.setParameters(cameraParams);
      mCamera.startPreview();
      eventListener.onStopRecordVideo(this.recordFilePath);
    } catch (Exception e) {
      eventListener.onStopRecordVideoError(e.getMessage());
    }
  }

  public void muteStream(boolean mute, Activity activity) {
    AudioManager audioManager = ((AudioManager)activity.getApplicationContext().getSystemService(Context.AUDIO_SERVICE));
    int direction = mute ? audioManager.ADJUST_MUTE : audioManager.ADJUST_UNMUTE;
  }

  public void setFocusArea(final int pointX, final int pointY, final Camera.AutoFocusCallback callback) {
    if (mCamera != null) {
      mCamera.cancelAutoFocus();

      Camera.Parameters parameters = mCamera.getParameters();

      Rect focusRect = calculateTapArea(pointX, pointY);
      parameters.setFocusMode(Camera.Parameters.FOCUS_MODE_AUTO);
      parameters.setFocusAreas(Arrays.asList(new Camera.Area(focusRect, 1000)));

      if (parameters.getMaxNumMeteringAreas() > 0) {
        parameters.setMeteringAreas(Arrays.asList(new Camera.Area(focusRect, 1000)));
      }

      try {
        setCameraParameters(parameters);
        mCamera.autoFocus(callback);
      } catch (Exception e) {
        Log.d(TAG, e.getMessage());
        callback.onAutoFocus(false, this.mCamera);
      }
    }
  }

  private Rect calculateTapArea(float x, float y) {
    if (x < 100) {
      x = 100;
    }
    if (x > width - 100) {
      x = width - 100;
    }
    if (y < 100) {
      y = 100;
    }
    if (y > height - 100) {
      y = height - 100;
    }
    return new Rect(
      Math.round((x - 100) * 2000 / width  - 1000),
      Math.round((y - 100) * 2000 / height - 1000),
      Math.round((x + 100) * 2000 / width  - 1000),
      Math.round((y + 100) * 2000 / height - 1000)
    );
  }

  static Camera.Size getBestResolution(Camera.Parameters cp) {
    List<Camera.Size> sl = cp.getSupportedVideoSizes();

    if (sl == null)
      sl = cp.getSupportedPictureSizes();

    Camera.Size large = sl.get(0);

    for (Camera.Size s : sl) {
      if ((large.height * large.width) < (s.height * s.width)) {
        large = s;
      }
    }

    return large;
  }

  public Bitmap getResizedBitmap(Bitmap image, int maxSize) {
    int width = image.getWidth();
    int height = image.getHeight();

    float bitmapRatio = (float)width / (float) height;
    if (bitmapRatio > 1) {
      width = maxSize;
      height = (int) (width / bitmapRatio);
    } else {
      height = maxSize;
      width = (int) (height * bitmapRatio);
    }
    return Bitmap.createScaledBitmap(image, width, height, true);
  }

  public String compressImage(String imageUri, int rotationDegrees) {

   String filePath = (imageUri);

   // String filePath = (imageUri);
    Bitmap scaledBitmap = null;

    BitmapFactory.Options options = new BitmapFactory.Options();

//      by setting this field as true, the actual bitmap pixels are not loaded in the memory. Just the bounds are loaded. If
//      you try the use the bitmap here, you will get null.
    options.inJustDecodeBounds = true;
    Bitmap bmp = BitmapFactory.decodeFile(filePath, options);

    int actualHeight = options.outHeight;
    int actualWidth = options.outWidth;

//      max Height and width values of the compressed image is taken as 816x612

    // float maxHeight = 816.0f;
    // float maxWidth = 612.0f;
    float maxHeight = 1024.0f;
    float maxWidth = 728.0f;

    if (rotationDegrees == 90 || rotationDegrees == 270) {
        maxHeight = 970.0f;
        maxWidth = 728.0f;
    }



    float imgRatio = actualWidth / actualHeight;
    float maxRatio = maxWidth / maxHeight;

//      width and height values are set maintaining the aspect ratio of the image

    if (actualHeight > maxHeight || actualWidth > maxWidth) {
      if (imgRatio < maxRatio) {
        imgRatio = maxHeight / actualHeight;
        actualWidth = (int) (imgRatio * actualWidth);
        actualHeight = (int) maxHeight;
      } else if (imgRatio > maxRatio) {
        imgRatio = maxWidth / actualWidth;
        actualHeight = (int) (imgRatio * actualHeight);
        actualWidth = (int) maxWidth;
      } else {
        actualHeight = (int) maxHeight;
        actualWidth = (int) maxWidth;

      }
    }

//      setting inSampleSize value allows to load a scaled down version of the original image

    options.inSampleSize = calculateInSampleSize(options, actualWidth, actualHeight);

//      inJustDecodeBounds set to false to load the actual bitmap
    options.inJustDecodeBounds = false;

//      this options allow android to claim the bitmap memory if it runs low on memory
    options.inPurgeable = true;
    options.inInputShareable = true;
    options.inTempStorage = new byte[16 * 1024];

    try {
//          load the bitmap from its path
      bmp = BitmapFactory.decodeFile(filePath, options);
    } catch (OutOfMemoryError exception) {
      exception.printStackTrace();

    }
    try {
      scaledBitmap = Bitmap.createBitmap(actualWidth, actualHeight, Bitmap.Config.ARGB_8888);
    } catch (OutOfMemoryError exception) {
      exception.printStackTrace();
    }

    float ratioX = actualWidth / (float) options.outWidth;
    float ratioY = actualHeight / (float) options.outHeight;
    float middleX = actualWidth / 2.0f;
    float middleY = actualHeight / 2.0f;

    Matrix scaleMatrix = new Matrix();
    scaleMatrix.setScale(ratioX, ratioY, middleX, middleY);

    Canvas canvas = new Canvas(scaledBitmap);
    canvas.setMatrix(scaleMatrix);
    canvas.drawBitmap(bmp, middleX - bmp.getWidth() / 2, middleY - bmp.getHeight() / 2, new Paint(Paint.FILTER_BITMAP_FLAG));

//      check the rotation of the image and display it properly
    ExifInterface exif;
    try {
      exif = new ExifInterface(filePath);

      int orientation = exif.getAttributeInt(
              ExifInterface.TAG_ORIENTATION, 0);
      Log.d("EXIF", "Exif: " + orientation);
      Matrix matrix = new Matrix();
      if (orientation == 6) {
        matrix.postRotate(90);
        Log.d("EXIF", "Exif: " + orientation);
      } else if (orientation == 3) {
        matrix.postRotate(180);
        Log.d("EXIF", "Exif: " + orientation);
      } else if (orientation == 8) {
        matrix.postRotate(270);
        Log.d("EXIF", "Exif: " + orientation);
      }
      scaledBitmap = Bitmap.createBitmap(scaledBitmap, 0, 0,
              scaledBitmap.getWidth(), scaledBitmap.getHeight(), matrix,
              true);
    } catch (IOException e) {
      e.printStackTrace();
    }

    File file = new File(filePath);
    boolean deleted = file.delete();
    Log.v("log_tag","deleted: " + deleted);

    FileOutputStream out = null;
    //String filename = getFilename();
    String filename = getTempFilePath();
    try {
      out = new FileOutputStream(filename);

//          write the compressed bitmap at the destination specified by filename.
      scaledBitmap.compress(Bitmap.CompressFormat.JPEG, 80, out);

    } catch (FileNotFoundException e) {
      e.printStackTrace();
    }

    return filename;

  }

  public String getFilename() {
    File file = new File(Environment.getExternalStorageDirectory().getPath(), "MyFolder/Images");
    if (!file.exists()) {
      file.mkdirs();
    }
    String uriSting = (file.getAbsolutePath() + "/" + System.currentTimeMillis() + ".jpg");
    return uriSting;

  }

  private String getRealPathFromURI(String contentURI) {
    Uri contentUri = Uri.parse(contentURI);
    Cursor cursor = getActivity().getContentResolver().query(contentUri, null, null, null, null);
    if (cursor == null) {
      return contentUri.getPath();
    } else {
      cursor.moveToFirst();
      int index = cursor.getColumnIndex(MediaStore.Images.ImageColumns.DATA);
      return cursor.getString(index);
    }
  }

  public int calculateInSampleSize(BitmapFactory.Options options, int reqWidth, int reqHeight) {
    final int height = options.outHeight;
    final int width = options.outWidth;
    int inSampleSize = 1;

    if (height > reqHeight || width > reqWidth) {
      final int heightRatio = Math.round((float) height / (float) reqHeight);
      final int widthRatio = Math.round((float) width / (float) reqWidth);
      inSampleSize = heightRatio < widthRatio ? heightRatio : widthRatio;
    }
    final float totalPixels = width * height;
    final float totalReqPixelsCap = reqWidth * reqHeight * 2;
    while (totalPixels / (inSampleSize * inSampleSize) > totalReqPixelsCap) {
      inSampleSize++;
    }

    return inSampleSize;
  }

  @Override
  public void onStop() {

    if(this.mOrientationListener != null) {
      this.mOrientationListener.disable();
      this.mOrientationListener = null;
    }
    // stop the preview
    if (mCamera != null) {
      setDefaultCameraId();
      mPreview.setCamera(null, -1);
      mCamera.setPreviewCallback(null);
      mCamera.release();
      mCamera = null;
    }
    super.onStop();
  }

  private void setOrientationListener() {

    mOrientationListener = new SimpleOrientationListener(getActivity()) {

      @Override
      public void onSimpleOrientationChanged(int orientation) {

        if (orientation == SimpleOrientationListener.ORIENTATION_LANDSCAPE_RIGHT) {
          Log.d(TAG, "ORIENTATION_LANDSCAPE_RIGHT");
          rotationDegrees = 180;
        } else if (orientation == SimpleOrientationListener.ORIENTATION_LANDSCAPE_LEFT) {
          Log.d(TAG, "ORIENTATION_LANDSCAPE_LEFT");
          rotationDegrees = 0;
        }
        //Log.d(TAG, "ORIENTATION_LANDSCAPE: "+ rotation);
        else if (orientation == SimpleOrientationListener.ORIENTATION_PORTRAIT) {
          Log.d(TAG, "ORIENTATION_PORTRAIT");
          rotationDegrees = 90;
        } else {
          Log.d(TAG, "ORIENTATION_PORTRAIT_UPSIDE_DOWN");
          rotationDegrees = 270;
        }


      }
    };
    mOrientationListener.enable();

  }

}


//https://github.com/boxme/SquareCamera/blob/aa1d02be33104e312c8658bec3f896a7181ebacd/squarecamera/src/main/java/com/desmond/squarecamera/CameraFragment.java#L566
