package com.test.view.rest.controllers;

import java.util.ArrayList;
import java.util.List;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.test.view.rest.presentation.LabelDto;

@RestController
public class LabelController {

	/**
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/label/searchByValue/{searchVal}", method = RequestMethod.GET)
	public @ResponseBody
	List<LabelDto> searchByValue() {
		List<LabelDto> dtos= new ArrayList<>();
		LabelDto dto = new LabelDto();
		
		dto.setDescription("desc");
		dto.setId("1");
		dto.setKey("key");
		dto.setLocaleId("1");
		dto.setValue("");
		dtos.add(dto);
		
		dto = new LabelDto();
		dto.setDescription("desc2");
		dto.setId("2");
		dto.setKey("key2");
		dto.setLocaleId("3");
		dto.setValue("val");
		dtos.add(dto);
		
		return dtos;
	}
}
