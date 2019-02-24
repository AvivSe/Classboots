import { Component, OnInit } from '@angular/core';
import Typed from 'typed.js/src/typed.js';
import {AuthService} from "../../partitial/auth/auth.service";
import {entitiesService} from "../../partitial/entities/entities.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  statistics = {institutions: 75926,schools:2946,lectures:122326,videos:23123468};

  constructor(public authService : AuthService,private entitiesService : entitiesService){}
  ngOnInit() {
    const options = {
      strings: ["Hello!","Welcome to ClassBoost", "Welcome to ClassBoots* !","First you have to select a Institution.","So get down with the scroller..","AND START TO SUCCESS!"],
      // Optionally use an HTML element to grab strings from (must wrap each string in a <p>)
      stringsElement: null,
      // typing speed
      typeSpeed: 80,
      // time before typing starts
      startDelay: 1000,
      // backspacing speed
      backSpeed: 50,
      // time before backspacing
      backDelay: 1000,
      // loop
      loop: true,
      // false = infinite
      loopCount: 5,
      // show cursor
      showCursor: false,
      // character for cursor
      cursorChar: '|',
      // attribute to type (null == text)
      attr: null,
      // either html or text
      contentType: 'html',
      // call when done callback function
      callback: function() {},
      // starting callback function before each string
      preStringTyped: function() {},
      //callback for every typed string
      onStringTyped: function() {},
      // callback for reset
      resetCallback: function() {}
    };
    const typed = new Typed('.typed', options);
    this.entitiesService.statisticsEmitter.subscribe(data =>{
      this.statistics = data;
    })
  }
}
