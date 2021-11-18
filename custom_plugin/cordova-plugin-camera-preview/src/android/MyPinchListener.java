package com.cordovaplugincamerapreview;

import android.view.ScaleGestureDetector;

public class MyPinchListener extends ScaleGestureDetector.SimpleOnScaleGestureListener {
  @Override
  public boolean onScale(ScaleGestureDetector detector) {

    float scaleFactor = detector.getScaleFactor();

    if (scaleFactor > 1) {
      System.out.println("Zooming Out");
    } else {
      System.out.println("Zooming In");
    }
    return true;
  }

  @Override
  public boolean onScaleBegin(ScaleGestureDetector detector) {
    return true;
  }

  @Override
  public void onScaleEnd(ScaleGestureDetector detector) {

  }
}
