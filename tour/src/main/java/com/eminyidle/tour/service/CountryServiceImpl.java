package com.eminyidle.tour.service;

import com.eminyidle.tour.dto.*;
import com.eminyidle.tour.exception.NoSuchCountryException;
import com.eminyidle.tour.repository.CityRepository;
import com.eminyidle.tour.repository.CountryNodeRepository;
import com.eminyidle.tour.repository.maria.CountryCityRepository;
import com.eminyidle.tour.repository.maria.CountryCurrencyRepository;
import com.eminyidle.tour.repository.maria.CountryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
//@RequiredArgsConstructor
public class CountryServiceImpl implements CountryService {

    private final CountryRepository countryRepository;
    private final CountryCurrencyRepository countryCurrencyRepository;
    private final CountryCityRepository cityRepository;
    private final CountryNodeRepository graphRepository;

    public CountryServiceImpl(CountryRepository countryRepository, CountryCurrencyRepository countryCurrencyRepository, CountryCityRepository cityRepository, CountryNodeRepository graphRepository) {
        this.countryRepository = countryRepository;
        this.countryCurrencyRepository = countryCurrencyRepository;
        this.cityRepository = cityRepository;
        this.graphRepository = graphRepository;

        initNode();
    }

    private void initNode() {
        countryRepository.findAll().stream().forEach(countryEntity -> {
                    graphRepository.save(Country.builder()
                            .countryCode(countryEntity.getCountryCode())
                            .countryName(countryEntity.getCountryNameKor())
//                            .cityList(cityRepository.findAllByCountryCode(countryEntity.getCountryCode()).stream().map(cityEntity ->
//                                    City.builder()
//                                            .id(cityEntity.getId())
//                                            .cityName(cityEntity.getCityNameKor())
//                                            .countryCode(cityEntity.getCountryCode())
//                                            .build()
//
//                            ).toList())
                            .build()
                    );
                }
        );


    }

    @Override
    public List<Country> searchCountryList() {

        return countryRepository.findAll().stream().map(countryEntity ->
                Country.builder()
                        .countryCode(countryEntity.getCountryCode())
                        .countryName(countryEntity.getCountryNameKor())
                        .build()
        ).toList();
    }

    @Override
    public List<City> searchCityList(String countryCode) {
        return cityRepository.findAllByCountryCode(countryCode).stream().map(
                cityEntity -> City.builder() //TODO - cityID는 마리아디비에서 챙겨야 할까?
                        .cityName(cityEntity.getCityNameKor())
                        .countryCode(cityEntity.getCountryCode())
                        .build()
        ).toList();
    }

    @Override
    public CountryInfo searchCountryInfo(String countryCode) {
        CountryEntity country = countryRepository.findById(countryCode).orElseThrow(NoSuchCountryException::new);
        CountryCurrency currency = countryCurrencyRepository.findById(countryCode).orElseThrow(NoSuchCountryException::new);

        return CountryInfo.builder()
                .KST(country.getUtc() - 9)
                .climate(country.getClimate())
                .currencyUnit(currency.getCurrencySign())
                .language(country.getLanguage())
                .plug_type(country.getPlug_type())
                .voltage(country.getVoltage())
                .build();
    }
}
